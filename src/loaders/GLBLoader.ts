import { Material } from "../materials/Material";
import { PhysMaterial } from "../materials/physical/PhysMaterial";
import { Attribute, TypedArray } from "../modules/Attribute";
import { Geometry } from "../modules/Geometry";
import { Texture } from "../modules/Texture";
import { Mesh } from "../objects/Mesh";
import { TRSObject } from "../objects/TRSObject";
import { WebGLConstants } from "../renderer/WebGLConstants";

class GLBHelper {

    public static readonly textDecoder = new TextDecoder();
    public static readonly material = new PhysMaterial();

    public static readonly filterMapping = new Map([

        [9728, WebGLConstants.NEAREST],
        [9729, WebGLConstants.LINEAR],
        [9984, WebGLConstants.NEAREST_MIPMAP_NEAREST],
        [9985, WebGLConstants.LINEAR_MIPMAP_NEAREST],
        [9986, WebGLConstants.NEAREST_MIPMAP_LINEAR],
        [9987, WebGLConstants.LINEAR_MIPMAP_LINEAR],

    ]);

    public static readonly wrapMapping = new Map([

        [10497, WebGLConstants.REPEAT],
        [33071, WebGLConstants.CLAMP_TO_EDGE],
        [33648, WebGLConstants.MIRRORED_REPEAT],

    ]);

    public static readonly sizeMapping = new Map([

        ['SCALAR', 1],
        ['VEC2', 2],
        ['VEC3', 3],
        ['VEC4', 4],
        ['MAT2', 2],
        ['MAT3', 9],
        ['MAT4', 16],

    ]);

    public static getGeometryKey(primitive: any = {}): string {

        const geometryKey = [`indices:${primitive.indices};`]

        for (const key in primitive.attributes) {

            const index = primitive.attributes[key];

            geometryKey.push(`${key}:${index};`);

        }

        geometryKey.push(`mode:${primitive.mode};`)

        return geometryKey.join();

    }

    public static getAttributeName(name: string): string {

        switch (name) {

            case 'POSITION': return 'position';

            case 'NORMAL': return 'normal';

            case 'TANGENT': return 'tangent';

            case 'TEXCOORD_0': return 'uv';

            case 'TEXCOORD_1': return 'uv2';

            case 'COLOR_0': return 'color';

            case 'WEIGHTS_0': return 'skinWeight';

            case 'JOINTS_0': return 'skinIndex';

            default: return name.toLowerCase();

        }

    }

    public static createTypedArray(type: number, lenOrBuf: ArrayBuffer | number, offset?: number, length?: number): TypedArray {

        let constructor: any;

        switch (type) {

            case 5120:

                constructor = ArrayBuffer;
                break;

            case 5121:

                constructor = Uint8Array;
                break;

            case 5122:

                constructor = Int16Array;
                break;

            case 5123:

                constructor = Uint16Array;
                break;

            case 5125:

                constructor = Uint32Array;
                break;

            case 5126:
            default:

                constructor = Float32Array;

        }

        if (lenOrBuf instanceof ArrayBuffer) {

            return new constructor(lenOrBuf, offset, length);

        } else {

            return new constructor(lenOrBuf);

        }

    }

    public static mergeGeometries(geometries: Geometry[]): Geometry {

        const merge = new Geometry();

        if (!geometries.length) {

            return merge;

        }

        const usedNames = Object.keys(geometries[0].attributes);

        if (!usedNames.length) {
            return merge;
        }

        const usedIndices = geometries[0].indices !== undefined;
        const allAttributes: Attribute[][] = [];

        let startIndex = 0;

        for (let ii = 0, li = geometries.length; ii < li; ii++) {

            const geometry = geometries[ii];
            const attributes: Attribute[] = [];

            if (usedIndices) {

                if (!geometry.indices) {

                    console.warn(`Dxy.GLBLoader : ${ii} 个几何体缺少索引数据 . `);
                    continue;

                }

                attributes.push(geometry.indices);

            }

            let isBreak = false;

            for (const name of usedNames) {

                const attribute = geometry.getAttribute(name)

                if (!attribute) {

                    isBreak = true;
                    break;

                }

                attributes.push(attribute);

            }

            if (isBreak) {

                console.warn(`Dxy.GLBLoader : 第 ${ii} 个几何体缺少属性 . `);
                continue;

            }

            const count = attributes[0].count;

            merge.addGroup(startIndex, count, allAttributes.length);
            startIndex += count;

            allAttributes.push(attributes);

        }

        if (usedIndices) {

            const data: number[] = [];
            let offset = 0;

            for (const attributes of allAttributes) {

                const indices = attributes.shift() as Attribute;

                for (let ii = 0, li = indices.count; ii < li; ii++) {

                    data.push(indices.getX(ii) + offset);

                }

                offset += attributes[0].count;

            }

            merge.setIndices(data);

        }

        while (usedNames.length > 0) {

            const attributes = allAttributes.map(e => e.shift()) as Attribute[];
            const name = usedNames.shift() as string;

            const attribute = GLBHelper.mergeAttributes(attributes);

            if (attribute) {

                merge.setAttribute(name, attribute);

            }

        }

        return merge;

    }

    public static mergeAttributes(attributes: Attribute[]): Attribute | undefined {

        if (attributes.length === 0) {

            return undefined;

        }

        const dataType = attributes[0].dataType;
        const itemSize = attributes[0].itemSize;
        const normalized = attributes[0].normalized;

        let arrayLen = 0;

        for (let ii = 0, li = attributes.length; ii < li; ii++) {

            const attribute = attributes[ii];

            if (

                attribute.dataType !== dataType ||
                attribute.itemSize !== itemSize ||
                attribute.normalized !== normalized

            ) {

                console.warn(`Dxy.GLBLoader : 第 ${ii} 个缓冲属性类型错误 . `);
                return undefined;

            }

            arrayLen += attribute.array.length;

        }

        const array = GLBHelper.createTypedArray(dataType, arrayLen);
        let offset = 0;

        for (const attribute of attributes) {

            array.set(attribute.array, offset);
            offset += attribute.array.length;

        }

        return new Attribute(array, itemSize, normalized);

    }

}

class GBL {

    private objectDef: any;
    private bufferData: ArrayBuffer | undefined;
    private geometryCache = new Map<string, Geometry>();

    public constructor(

        private url: string,
        private onLoad?: Function

    ) { }

    public async parse(): Promise<TRSObject | undefined> {

        await this.requestData();

        let scene: TRSObject | undefined;

        if (this.objectDef.scenes) {

            scene = await this.loadScene(this.objectDef.scene);

        }

        if (typeof this.onLoad === 'function') {

            this.onLoad(scene);

        }

        return scene;

    }

    private async requestData(): Promise<void> {

        const response = await fetch(this.url);

        const data = await response.arrayBuffer();
        const dataView = new DataView(data);

        // const magic = _textDecoder.decode(new Uint8Array(data, 0, 4)); // 'glTF'
        // const version = dataView.getUint32(4, true); // 2

        const length = dataView.getUint32(8, true);

        let index = 12, chunkLength: number, chunkType: number;
        let objectDef: string | undefined, bufferData: ArrayBuffer | undefined;

        while (index < length) {

            chunkLength = dataView.getUint32(index, true);
            index += 4;

            chunkType = dataView.getUint32(index, true);
            index += 4;

            // json
            if (chunkType === 0x4E4F534A) {

                const defData = new Uint8Array(data, index, chunkLength);
                objectDef = GLBHelper.textDecoder.decode(defData);

            }

            // bin
            else if (chunkType === 0x004E4942) {

                bufferData = data.slice(index, index + chunkLength);

            }

            index += chunkLength;

        }

        this.objectDef = objectDef ? JSON.parse(objectDef) : {};
        this.bufferData = bufferData;

    }

    private async loadScene(index: number): Promise<TRSObject> {

        const sceneDef = this.objectDef.scenes[index];

        const scene = new TRSObject();
        scene.name = sceneDef.name || '';

        for (const nodeIndex of sceneDef.nodes) {

            const node = await this.loadNode(nodeIndex);
            scene.add(node);

        }

        return scene;

    }

    private async loadNode(index: number): Promise<TRSObject> {

        const nodeDef = this.objectDef.nodes[index];

        if (nodeDef.instance) {

            return nodeDef.instance;

        }

        let node: TRSObject;

        if (nodeDef.mesh !== undefined) {

            node = await this.loadMesh(nodeDef.mesh);

        } else {

            node = new TRSObject();

        }

        node.name = nodeDef.name || '';

        if (nodeDef.translation !== undefined) {

            node.position.setFromArray(nodeDef.translation as number[]);

        }

        if (nodeDef.rotation !== undefined) {

            node.rotation.setFromArray(nodeDef.rotation as number[]);

        }

        if (nodeDef.scale !== undefined) {

            node.scale.setFromArray(nodeDef.scale as number[]);

        }

        if (nodeDef.children !== undefined) {

            for (const childIndex of nodeDef.children) {

                const child = await this.loadNode(childIndex);
                node.add(child);

            }

        }

        nodeDef.instance = node;

        return node;

    }

    private async loadMesh(index: number): Promise<Mesh> {

        const meshDef = this.objectDef.meshes[index];

        if (meshDef.instance !== undefined) {

            return meshDef.instance;

        }

        const primitives = meshDef.primitives;

        const geometryKeys: string[] = [];
        const geometries = this.loadGeometries(primitives, geometryKeys);

        const materials = await this.loadMaterials(primitives);

        let mesh: Mesh;

        if (geometries.length === 1) {

            mesh = new Mesh(geometries[0], materials[0]);

        } else {

            const key = geometryKeys.join('_');
            let geometry = this.geometryCache.get(key);

            if (!geometry) {

                geometry = GLBHelper.mergeGeometries(geometries);
                this.geometryCache.set(key, geometry);

            }

            mesh = new Mesh(geometry, materials);

        }

        meshDef.instance = mesh;

        return mesh;

    }

    private loadGeometries(primitives: any[], keys: string[]): Geometry[] {

        const geometries: Geometry[] = [];

        let geometry: Geometry | undefined;

        for (const primitive of primitives) {

            const key = GLBHelper.getGeometryKey(primitive);
            geometry = this.geometryCache.get(key);

            if (!geometry) {

                geometry = new Geometry();

                for (const key in primitive.attributes) {

                    const attributeName = GLBHelper.getAttributeName(key);

                    if (geometry.hasAttribute(attributeName)) {

                        continue;

                    }

                    const accessorIndex = primitive.attributes[key];
                    const attribute = this.loadAttribute(accessorIndex);

                    geometry.setAttribute(attributeName, attribute);

                }

                if (primitive.indices !== undefined) {

                    const attribute = this.loadAttribute(primitive.indices);
                    geometry.indices = attribute;

                }

                this.geometryCache.set(key, geometry);

            }

            keys.push(key);
            geometries.push(geometry);

        }

        return geometries;

    }

    private loadAttribute(index: number): Attribute {

        const accessorDef = this.objectDef.accessors[index];

        const itemSize = GLBHelper.sizeMapping.get(accessorDef.type) || 0;
        const type = accessorDef.componentType;
        const count = accessorDef.count;
        const offset = accessorDef.byteOffset || 0;
        const normalized = accessorDef.normalized === true;

        const buffer = this.loadBufferView(accessorDef.bufferView);
        const typedArray = GLBHelper.createTypedArray(type, buffer, offset, count * itemSize);

        return new Attribute(typedArray, itemSize, normalized);

    }

    private async loadMaterials(primitives: any[]): Promise<Material[]> {

        const materials: Material[] = []

        for (const primitive of primitives) {

            if (primitive.material === undefined) {

                materials.push(GLBHelper.material);
                continue;

            }

            const materialDef = this.objectDef.materials[primitive.material];

            if (materialDef.instance) {

                materials.push(materialDef.instance);
                continue;

            }

            const material = new PhysMaterial();
            materialDef.instance = material;

            material.name = materialDef.name;

            const pbr = materialDef.pbrMetallicRoughness;

            if (Array.isArray(pbr.baseColorFactor)) {

                material.color.setFromArray(pbr.baseColorFactor as number[]);
                material.opacity = pbr.baseColorFactor[3];

            }

            if (pbr.baseColorTexture !== undefined) {

                const texture = await this.loadTexture(pbr.baseColorTexture.index);
                material.map = texture;

            }

            material.metalness = pbr.metallicFactor !== undefined ? pbr.metallicFactor : 1;
            material.roughness = pbr.roughnessFactor !== undefined ? pbr.roughnessFactor : 1;

            if (pbr.metallicRoughnessTexture !== undefined) {

                const texture = await this.loadTexture(pbr.metallicRoughnessTexture.index);
                material.metalnessMap = texture;
                material.roughnessMap = texture;

            }

            if (materialDef.normalTexture !== undefined) {

                // const texture = await this.loadTexture(materialDef.normalTexture.index);

                // material.normalMap = texture;
                // material.normalScale = new Vector2(1, 1);

                // if (materialDef.normalTexture.scale !== undefined) {

                //     material.normalScale.set(materialDef.normalTexture.scale, materialDef.normalTexture.scale);

                // }

            }

            if (materialDef.occlusionTexture !== undefined) {

                // aoMap

            }

            if (materialDef.emissiveFactor !== undefined) {

                // emissive

            }

            if (materialDef.extensions !== undefined) {

                // const key = 'KHR_materials_emissive_strength';

                // if (materialDef.extensions[key] !== undefined) {

                //     const emissiveStrength = materialDef.extensions[key].emissiveStrength;

                //     if (emissiveStrength !== undefined) {

                //         material.emissiveIntensity = emissiveStrength;

                //     }

                // }

            }

            if (materialDef.emissiveTexture !== undefined) {

                // emissiveMap

            }

            // 双面渲染
            if (materialDef.doubleSided === true) {

                material.backfaceCulling = false;

            }

            // 透明模式
            if (materialDef.alphaMode === 'BLEND') {

                // material.transparent = true;
                // material.depthWrite = false; todo: 需要测试

            } else {

                // 'OPAQUE' 'MASK'

                // material.transparent = false;

                // if (materialDef.alphaMode === 'MASK') {

                // 	if (materialDef.alphaCutoff === undefined) {

                // 		// material.alphaTest = 0.5;

                // 	} else {

                // 		// material.alphaTest = materialDef.alphaCutoff;

                // 	}

                // }

            }

            materials.push(material);

        }

        return materials;

    }

    private async loadTexture(index: number,): Promise<Texture> {

        const textureDef = this.objectDef.textures[index];

        if (textureDef.instance) {

            return textureDef.instance;

        }

        const imageDef = this.objectDef.images[textureDef.source];

        if (!imageDef.instance) {

            const buffer = this.loadBufferView(imageDef.bufferView)
            const blob = new Blob([buffer], { type: imageDef.mimeType });

            imageDef.instance = await createImageBitmap(blob, { colorSpaceConversion: 'none' });

        }

        const texture = new Texture(imageDef.instance);
        textureDef.instance = texture;

        const samplerDef = this.objectDef.samplers[textureDef.sampler];
        texture.magFilter = GLBHelper.filterMapping.get(samplerDef.magFilter) || texture.magFilter;
        texture.minFilter = GLBHelper.filterMapping.get(samplerDef.minFilter) || texture.minFilter;
        texture.wrapS = GLBHelper.wrapMapping.get(samplerDef.wrapS) || texture.wrapS;
        texture.wrapT = GLBHelper.wrapMapping.get(samplerDef.wrapT) || texture.wrapT;

        return texture;

    }

    private loadBufferView(index: number): ArrayBuffer {

        const bufferViewDef = this.objectDef.bufferViews[index];

        const byteLength = bufferViewDef.byteLength;
        const byteOffset = bufferViewDef.byteOffset || 0;

        if (this.bufferData) {

            return this.bufferData.slice(byteOffset, byteOffset + byteLength);

        } else {

            return new ArrayBuffer(byteLength);

        }

    }

}

export class GLBLoader {

    public static async load(url: string, onLoad?: Function): Promise<TRSObject | undefined> {

        return new GBL(url, onLoad).parse();

    }

}
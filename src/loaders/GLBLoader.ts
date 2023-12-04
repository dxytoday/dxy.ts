import { TRSNode } from "../objects/TRSNode";
import { Entity } from "../objects/Entity";
import { Attribute } from "../objects/modules/Attribute";
import { Geometry } from "../objects/modules/Geometry";
import { Material, MeshMaterial } from "../objects/modules/Material";
import { Texture } from "../objects/modules/Texture";
import { Util } from "../bases/Util";
import { Vector2 } from "../struct/Vector2";
import { LoggerProxy } from "../bases/LoggerProxy";

const _textDecoder = /*@__PURE__*/ new TextDecoder();

export class GLBLoader {

	public static async load(url: string, onLoad?: Function): Promise<TRSNode> {

		const glb = new GBL(url, onLoad);

		// glb.mergeGeometry = true;

		return glb.getScene();

	}

}

class GLBHelper {

	public static getItemSize(type: string): number {

		switch (type) {

			case 'SCALAR': return 1;

			case 'VEC2': return 2;

			case 'VEC3': return 3;

			case 'VEC4': return 4;

			case 'MAT2': return 4;

			case 'MAT3': return 9;

			case 'MAT4': return 16;

			default: return 0;

		}

	}

	public static getGeometryKey(glbPrimitive: GLBPrimitive): string {

		const geometryKey = [`indices:${glbPrimitive.indices};`]

		for (const key in glbPrimitive.attributes) {

			const index = glbPrimitive.attributes[key];

			geometryKey.push(`${key}:${index};`);

		}

		geometryKey.push(`mode:${glbPrimitive.mode};`)

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

	public static getFilter(type: number): number {

		switch (type) {

			case 9728:

				return Util.NEAREST;

			case 9729:

				return Util.LINEAR;

			case 9984:

				return Util.NEAREST_MIPMAP_NEAREST;

			case 9985:

				return Util.LINEAR_MIPMAP_NEAREST;

			case 9986:

				return Util.NEAREST_MIPMAP_LINEAR;

			case 9987:

				return Util.LINEAR_MIPMAP_LINEAR;

		}

		return undefined;

	}

	public static getWrap(type: number): number {

		switch (type) {

			case 33071:

				return Util.CLAMP_TO_EDGE;

			case 33648:

				return Util.MIRRORED_REPEAT;

			case 10497:

				return Util.REPEAT;

		}

		return undefined;

	}

	public static getTypeArray(type: number, buffer: ArrayBuffer, offset: number, length: number): TypedArray {

		switch (type) {

			case 5120:

				return new Int8Array(buffer, offset, length);

			case 5121:

				return new Uint8Array(buffer, offset, length);

			case 5122:

				return new Int16Array(buffer, offset, length);

			case 5123:

				return new Uint16Array(buffer, offset, length);

			case 5125:

				return new Uint32Array(buffer, offset, length);

			case 5126:

				return new Float32Array(buffer, offset, length);

		}

	}

	public static mergeGeometries(geometries: Geometry[], templateIndex = 0): Geometry {

		//#region 设置模板数据

		const merge = new Geometry();

		if (geometries.length === 0) {

			return merge;

		}

		if (geometries.length >= templateIndex) {

			templateIndex = geometries.length - 1;

		}

		const template = geometries[templateIndex];

		if (template.attributes.size === 0) {

			return merge;

		}

		if (templateIndex !== 0) {

			// 模板几何体调整到第 0 个
			geometries.sort(e => e === template ? -1 : 1);

		}

		const usedIndices = template.indices !== undefined;

		const usedNames = Array.from(template.attributes.keys());

		if (usedNames.includes('position') === true) {

			// 'position' 调整到第 0 个
			usedNames.sort(n => n === 'position' ? -1 : 1);

		}

		//#endregion

		//#region 获取缓冲属性

		const allAttributes: Attribute[][] = [];

		let startIndex = 0;

		for (let ii = 0, li = geometries.length; ii < li; ii++) {

			const geometry = geometries[ii];

			//#region 检查索引数据设置是否正确

			if (usedIndices === true && geometry.indices === undefined) {

				LoggerProxy.warn(`Dxy.Geometry.merge：第 ${ii} 个几何体缺少索引数据。`);
				return merge;

			}

			//#endregion

			const attributes: Attribute[] = [];

			//#region 获取所有缓冲属性

			for (const name of usedNames) {

				const attribute = geometry.getAttribute(name);

				if (attribute === undefined) {

					LoggerProxy.warn(`Dxy.Geometry.merge：第 ${ii} 个几何体缺少索引数据。`);
					return merge;

				}

				attributes.push(attribute);

			}

			//#endregion

			//#region 缓冲属性数量是否一致

			if (attributes.length !== usedNames.length) {

				LoggerProxy.warn(`Dxy.Geometry.merge：第 ${ii} 个几何体与模板的属性数量不一致。`);
				return merge;

			}

			//#endregion

			//#region 设置分组渲染

			let count = 0

			if (usedIndices === true) {

				attributes.push(geometry.indices); // 记录索引数据用于合并
				count = geometry.indices.count;

			} else {

				count = attributes[0].count;

			}

			merge.addGroup(startIndex, count, allAttributes.length);
			startIndex += count;

			//#endregion

			allAttributes.push(attributes); // 记录缓冲属性

		}

		//#endregion

		//#region 合并索引数据

		if (usedIndices === true) {

			const data: number[] = [];

			let offset = 0;

			for (const attributes of allAttributes) {

				const indices = attributes.pop();

				for (let ii = 0; ii < indices.count; ii++) {

					data.push(indices.getX(ii) + offset);

				}

				offset += attributes[0].count;

			}

			merge.setIndices(data);

		}

		//#endregion

		//#region 合并缓冲属性

		while (usedNames.length > 0) {

			const attributes = allAttributes.map(e => e.shift());

			const name = usedNames.shift();
			const attribute = GLBHelper.mergeAttributes(attributes);

			if (attribute === undefined) {

				continue;

			}

			merge.setAttribute(name, attribute);

		}

		//#endregion

		return merge;

	}

	public static mergeAttributes(attributes: Attribute[], templateIndex = 0): Attribute {

		if (attributes.length === 0) {

			return undefined;

		}

		if (attributes.length >= templateIndex) {

			templateIndex = attributes.length - 1;

		}

		const template = attributes[templateIndex];

		if (templateIndex !== 0) {

			// 模板缓冲属性调整到第 0 个
			attributes.sort(e => e === template ? -1 : 1);

		}

		let arrayLength = 0;

		for (let ii = 0, li = attributes.length; ii < li; ii++) {

			const attribute = attributes[ii];

			if (attribute.array.constructor !== template.array.constructor) {

				LoggerProxy.warn(`Dxy.Attribute.merge：第 ${ii} 个缓冲属性与模板的类型不一致。`);
				return undefined;

			}

			if (attribute.itemSize !== template.itemSize) {

				LoggerProxy.warn(`Dxy.Attribute.merge：第 ${ii} 个缓冲属性与模板的 itemSize 不一致。`);
				return undefined;

			}

			if (attribute.normalized !== template.normalized) {

				LoggerProxy.warn(`Dxy.Attribute.merge：第 ${ii} 个缓冲属性与模板的 normalized 不一致。`);
				return undefined;

			}

			arrayLength += attribute.array.length;

		}

		let typedArray: TypedArray = new (template.array.constructor as any)(arrayLength)

		let offset = 0;

		for (const attribute of attributes) {

			typedArray.set(attribute.array, offset);

			offset += attribute.array.length;

		}

		return new Attribute(typedArray, template.itemSize, template.normalized);

	}

}

class GBL {

	public mergeGeometry = false;

	private content: string;
	private glbObject: GLBObject;
	private body: ArrayBuffer;

	private geometries = new Map<string, Geometry>();

	public constructor(

		private url: string,
		private onLoad?: Function

	) { }

	public async getScene(): Promise<TRSNode> {

		await this.requestData();

		const scene = await this.loadScene();

		if (this.onLoad instanceof Function) {

			this.onLoad(scene);

		}

		return scene;

	}

	private async requestData() {

		const response = await fetch(this.url);

		const data = await response.arrayBuffer();
		const dataView = new DataView(data);

		// const magic = _textDecoder.decode(new Uint8Array(data, 0, 4)); // 'glTF'
		// const version = dataView.getUint32(4, true); // 2

		const length = dataView.getUint32(8, true);

		let index = 12, chunkLength: number, chunkType: number;
		let content: string, body: ArrayBuffer;

		while (index < length) {

			chunkLength = dataView.getUint32(index, true);
			index += 4;

			chunkType = dataView.getUint32(index, true);
			index += 4;

			// json
			if (chunkType === 0x4E4F534A) {

				const contentArray = new Uint8Array(data, index, chunkLength);

				content = _textDecoder.decode(contentArray);

			}

			// bin
			else if (chunkType === 0x004E4942) {

				body = data.slice(index, index + chunkLength);

			}

			index += chunkLength;

		}

		this.content = content;
		this.glbObject = JSON.parse(content);
		this.body = body;

	}

	private async loadScene(): Promise<TRSNode> {

		const sceneIndex = this.glbObject.scene;
		const glbScene = this.glbObject.scenes[sceneIndex];

		const scene = new TRSNode();
		scene.name = glbScene.name;

		for (const nodeIndex of glbScene.nodes) {

			const node = await this.loadNode(nodeIndex);

			if (node !== undefined) {

				scene.add(node);

			}

		}

		return scene;

	}

	private async loadNode(glbNodeIndex: number): Promise<TRSNode> {

		const glbNode = this.glbObject.nodes[glbNodeIndex];

		if (glbNode.instance !== undefined) {

			return glbNode.instance;

		}

		if (glbNode.mesh === undefined) {

			return;

		}

		const mesh = await this.loadMesh(glbNode.mesh);

		if (glbNode.translation !== undefined) {

			mesh.translation.fromArray(glbNode.translation);

		}

		if (glbNode.rotation !== undefined) {

			mesh.rotation.fromArray(glbNode.rotation);

		}

		if (glbNode.scale !== undefined) {

			mesh.scale.fromArray(glbNode.scale);

		}

		if (glbNode.children !== undefined) {

			for (const childIndex of glbNode.children) {

				const child = await this.loadNode(childIndex);

				mesh.add(child);

			}

		}

		glbNode.instance = mesh;

		return glbNode.instance;

	}

	private async loadMesh(glbMeshIndex: number): Promise<Entity> {

		const glbMesh = this.glbObject.meshes[glbMeshIndex];

		if (glbMesh.instance !== undefined) {

			return glbMesh.instance;

		}

		const glbPrimitives = glbMesh.primitives;

		const geometryKeys: string[] = [];
		const geometries = this.loadGeometries(glbPrimitives, geometryKeys);

		const materials = await this.loadMaterials(glbPrimitives);

		let node: TRSNode;

		if (glbPrimitives.length === 1) {

			node = new Entity(geometries[0], materials[0]);

		} else {

			if (this.mergeGeometry) {

				const key = geometryKeys.join('_');

				let geometry = this.geometries.get(key);

				if (geometry === undefined) {

					geometry = GLBHelper.mergeGeometries(geometries);

					this.geometries.set(key, geometry);

				}

				node = new Entity(geometry, materials);

			} else {

				node = new TRSNode();

				for (let ii = 0, li = glbPrimitives.length; ii < li; ii++) {

					const entity = new Entity(geometries[ii], materials[ii]);
					entity.name = `${glbMesh.name}_${ii}`;

					node.add(entity);

				}

			}

		}

		node.name = glbMesh.name;

		glbMesh.instance = node;

		return glbMesh.instance;

	}

	private loadGeometries(glbPrimitives: GLBPrimitive[], keys?: string[]): Geometry[] {

		const geometries: Geometry[] = [];

		let geometry: Geometry;

		for (const glbPrimitive of glbPrimitives) {

			const tuple = this.loadGeometry(glbPrimitive);

			geometries.push(tuple[1]);
			geometry = tuple[1];

			if (keys !== undefined) {

				keys.push(tuple[0]);

			}

		}

		return geometries;

	}

	private loadGeometry(glbPrimitive: GLBPrimitive): [string, Geometry] {

		const key = GLBHelper.getGeometryKey(glbPrimitive);

		let geometry = this.geometries.get(key);

		if (geometry !== undefined) {

			return [key, geometry];

		}

		geometry = new Geometry();

		for (const key in glbPrimitive.attributes) {

			const attributeName = GLBHelper.getAttributeName(key);

			if (geometry.hasAttribute(attributeName)) {

				continue;

			}

			const index = glbPrimitive.attributes[key];

			const attribute = this.loadAttribute(index);

			geometry.setAttribute(attributeName, attribute);

		}

		if (glbPrimitive.indices !== undefined) {

			const attribute = this.loadAttribute(glbPrimitive.indices, true);
			geometry.indices = attribute;

		}

		this.geometries.set(key, geometry);

		return [key, geometry];

	}

	private loadAttribute(glbAccessorIndex: number, isIndices = false): Attribute {

		const glbAccessor = this.glbObject.accessors[glbAccessorIndex];

		if (!isIndices && glbAccessor.instance !== undefined) {

			return glbAccessor.instance;

		}

		const buffer = this.loadBufferView(glbAccessor.bufferView);
		const itemSize = GLBHelper.getItemSize(glbAccessor.type);
		const arrayType = glbAccessor.componentType;
		const count = glbAccessor.count;
		const byteOffset = glbAccessor.byteOffset;

		const typedArray = GLBHelper.getTypeArray(arrayType, buffer, byteOffset, count * itemSize);

		const normalized = glbAccessor.normalized === true;

		glbAccessor.instance = new Attribute(typedArray, itemSize, normalized);

		return glbAccessor.instance;

	}

	private loadBufferView(glbBufferViewIndex: number): ArrayBuffer {

		const glbBufferView = this.glbObject.bufferViews[glbBufferViewIndex];

		if (glbBufferView.instance !== undefined) {

			return glbBufferView.instance;

		}

		const byteLength = glbBufferView.byteLength;
		const byteOffset = glbBufferView.byteOffset;

		glbBufferView.instance = this.body.slice(byteOffset, byteOffset + byteLength);

		return glbBufferView.instance;

	}

	private async loadMaterials(glbPrimitives: GLBPrimitive[]): Promise<Material[]> {

		const materials: Material[] = []

		for (const glbPrimitive of glbPrimitives) {

			if (glbPrimitive.material === undefined) {

				materials.push(new MeshMaterial());

			} else {

				const material = await this.loadMaterial(glbPrimitive.material);

				materials.push(material);

			}

		}

		return materials;

	}

	private async loadMaterial(glbMaterialindex: number): Promise<Material> {

		const glbMaterial = this.glbObject.materials[glbMaterialindex];

		if (glbMaterial.instance !== undefined) {

			return glbMaterial.instance;

		}

		const material = new MeshMaterial();

		glbMaterial.instance = material;

		material.name = glbMaterial.name;

		const pbr = glbMaterial.pbrMetallicRoughness;

		if (Array.isArray(pbr.baseColorFactor)) {

			material.color.fromArray(pbr.baseColorFactor);
			material.opacity = pbr.baseColorFactor[3];

		}

		if (pbr.baseColorTexture !== undefined) {

			const texture = await this.loadTexture(pbr.baseColorTexture.index);

			material.map = texture;

		}

		if (pbr.metallicFactor !== undefined) {

			material.metalness = pbr.metallicFactor;

		}

		if (pbr.roughnessFactor !== undefined) {

			material.roughness = pbr.roughnessFactor

		}

		if (pbr.metallicRoughnessTexture !== undefined) {

			// const texture = await this.loadTexture(pbr.metallicRoughnessTexture.index);

			// material.metalnessMap = texture;
			// material.roughnessMap = texture;

		}

		if (glbMaterial.normalTexture !== undefined) {

			const texture = await this.loadTexture(glbMaterial.normalTexture.index);

			material.normalMap = texture;
			material.normalScale = new Vector2(1, 1);

			if (glbMaterial.normalTexture.scale !== undefined) {

				material.normalScale.set(glbMaterial.normalTexture.scale, glbMaterial.normalTexture.scale);

			}

		}

		if (glbMaterial.occlusionTexture !== undefined) {

			// aoMap

		}

		if (glbMaterial.emissiveFactor !== undefined) {

			// emissive

		}

		if (glbMaterial.extensions !== undefined) {

			const key = 'KHR_materials_emissive_strength';

			if (glbMaterial.extensions[key] !== undefined) {

				const emissiveStrength = glbMaterial.extensions[key].emissiveStrength;

				if (emissiveStrength !== undefined) {

					material.emissiveIntensity = emissiveStrength;

				}

			}

		}

		if (glbMaterial.emissiveTexture !== undefined) {

			// emissiveMap

		}

		// 双面渲染

		if (glbMaterial.doubleSided === true) {

			material.backfaceCulling = false;

		}

		// 透明模式

		if (glbMaterial.alphaMode === 'BLEND') {

			// material.transparent = true;
			// material.depthWrite = false; todo: 需要测试

		} else {

			// 'OPAQUE' 'MASK'

			// material.transparent = false;

			// if (glbMaterial.alphaMode === 'MASK') {

			// 	if (glbMaterial.alphaCutoff === undefined) {

			// 		// material.alphaTest = 0.5;

			// 	} else {

			// 		// material.alphaTest = glbMaterial.alphaCutoff;

			// 	}

			// }

		}

		return material;

	}

	private async loadTexture(glbTextureindex: number,): Promise<Texture> {

		const glbTexture = this.glbObject.textures[glbTextureindex];

		if (glbTexture.instance !== undefined) {

			return glbTexture.instance;

		}

		const glbImage = this.glbObject.images[glbTexture.source];

		if (glbImage.instance === undefined) {

			const glbBufferView = this.glbObject.bufferViews[glbImage.bufferView];

			const byteLength = glbBufferView.byteLength;
			const byteOffset = glbBufferView.byteOffset || 0;

			const buffer = this.body.slice(byteOffset, byteOffset + byteLength);

			const blob = new Blob([buffer], { type: glbImage.mimeType });

			glbImage.instance = await createImageBitmap(blob, { colorSpaceConversion: 'none' });

		}

		const texture = new Texture(glbImage.instance);

		const glbSampler = this.glbObject.samplers[glbTexture.sampler];

		let value: number;

		value = GLBHelper.getFilter(glbSampler.magFilter);

		if (value !== undefined) {

			texture.magFilter = value;

		}

		value = GLBHelper.getFilter(glbSampler.minFilter);

		if (value !== undefined) {

			texture.minFilter = value;

		}

		value = GLBHelper.getWrap(glbSampler.wrapS);

		if (value !== undefined) {

			texture.wrapS = value;
		}

		value = GLBHelper.getWrap(glbSampler.wrapT);

		if (value !== undefined) {

			texture.wrapT = value;

		}

		glbTexture.instance = texture;

		return glbTexture.instance;

	}

}

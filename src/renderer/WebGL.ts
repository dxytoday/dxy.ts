import { BgMaterial } from "../materials/BgMaterial";
import { Material, Uniform } from "../materials/Material";
import { Attribute } from "../modules/Attribute";
import { Geometry } from "../modules/Geometry";
import { Texture } from "../modules/Texture";
import { Camera } from "../objects/Camera";
import { Mesh } from "../objects/Mesh";
import { Scene } from "../objects/Scene";
import { TRSNode } from "../objects/TRSNode";
import { Color } from "../structs/Color";
import { RenderObject, WebGLCache } from "./WebGLCache";
import { WebGLState } from "./WebGLState";

class ContextHelper {

    private static readonly attributes = {

        alpha: true,
        depth: true,
        stencil: true,
        antialias: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,

    }

    public static getWebGL2(canvas: HTMLCanvasElement): WebGL2RenderingContext {

        const context = canvas.getContext('webgl2', this.attributes);

        if (!context) {

            throw new Error('Dxy.WebGL : 当前环境不支持 webgl2 . ');

        }

        return context as WebGL2RenderingContext;

    }

}

export class WebGL {

    public readonly gl: WebGL2RenderingContext;

    public readonly cache: WebGLCache;
    public readonly state: WebGLState;

    public constructor(canvas: HTMLCanvasElement) {

        this.gl = ContextHelper.getWebGL2(canvas);

        this.cache = new WebGLCache(this);
        this.state = new WebGLState(this);

    }

    public render(scene: Scene, camera: Camera): void {

        const gl = this.gl;

        camera.updateMatrix();

        scene.ambientLight.update(camera);
        scene.directionalLight.update(camera);

        const renderList: RenderObject[] = [];
        this.projectObject(scene, camera, renderList);

        this.renderBackground(scene, camera, renderList);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        this.renderObject(renderList, scene, camera);

    }

    private projectObject(node: TRSNode, camera: Camera, renderList: RenderObject[]): void {

        if (!node.visible) {

            return;

        }

        node.updateMatrix();

        if (node instanceof Mesh) {

            node.updateModelViewMatrix(camera.viewMatrix);

            const geometry = node.geometry;

            if (Array.isArray(node.material)) {

                const materials = node.material;
                const renderGroups = geometry.groups;

                for (const group of renderGroups) {

                    const material = materials[group.materialIndex];

                    const object = this.cache.mallocRenderObject(node, geometry, material, group);
                    renderList.push(object);

                }

            } else {

                const object = this.cache.mallocRenderObject(node, geometry, node.material);
                renderList.push(object);

            }

        }

        for (const child of node.children) {

            this.projectObject(child, camera, renderList);

        }

    }

    private renderBackground(scene: Scene, camera: Camera, renderList: RenderObject[]): void {

        if (scene.background instanceof Color) {

            this.state.setClearColor(scene.background.r, scene.background.g, scene.background.b);

        } else if (scene.background instanceof Mesh) {

            const renderObject = this.cache.mallocRenderObject(

                scene.background,
                scene.background.geometry,
                scene.background.material as Material

            );

            renderList.unshift(renderObject);

        }

    }

    private renderObject(renderObjects: RenderObject[], scene: Scene, camera: Camera): void {

        for (const object of renderObjects) {

            const material = object.material as Material;
            const program = this.cache.acquireProgram(material);
            object.program = program;

            this.state.useProgram(program)

            this.bindGeometry(object);
            this.applyMaterial(object, scene, camera);
            this.renderBuffer(object);

        }

    }

    private bindGeometry(object: RenderObject): void {

        const geometry = object.geometry as Geometry;
        const program = object.program as WebGLProgram;

        const vao = this.cache.acquireVertexArray(geometry);

        this.state.bindVertexArray(vao);

        const webglAttributes = this.cache.acquireAttributes(program);

        for (const webglAttribute of webglAttributes) {

            const attribute = geometry.getAttribute(webglAttribute.name);

            if (!attribute) {

                webglAttribute.disable(vao);
                continue;

            }

            this.uploadAttributeToGPU(attribute, this.gl.ARRAY_BUFFER);

            webglAttribute.bind(attribute, vao);

        }

        if (geometry.indices !== undefined) {

            this.uploadAttributeToGPU(geometry.indices, this.gl.ELEMENT_ARRAY_BUFFER);

        }

    }

    private uploadAttributeToGPU(attribute: Attribute, target: number): void {

        let buffer = this.cache.getBuffer(attribute);

        if (!buffer) {

            buffer = this.cache.acquireBuffer(attribute);

            this.state.bindBuffer(target, buffer);
            this.gl.bufferData(target, attribute.array, attribute.dataUsage);

            attribute.needsUpdate = false;

        }

        if (attribute.needsUpdate === true) {

            this.state.bindBuffer(target, buffer);
            this.gl.bufferSubData(target, 0, attribute.array);

            attribute.needsUpdate = false;

        }

    }

    private applyMaterial(object: RenderObject, scene: Scene, camera: Camera): void {

        const mesh = object.mesh as Mesh;
        const material = object.material as Material;

        material.onBeforRender(scene, mesh, camera);

        const frontFaceCW = mesh.worldMatrix.determinant() < 0;
        this.state.setFrontFace(frontFaceCW);

        this.state.backfaceCulling(material.backfaceCulling);

        this.state.resetTextureUnits();

        this.uploadUniform(object);

    }

    private uploadUniform(object: RenderObject): void {

        const mesh = object.mesh as Mesh;
        const material = object.material as Material;
        const program = object.program as WebGLProgram;

        const webglUniforms = this.cache.acquireUniforms(program);

        for (const webglUniform of webglUniforms) {

            const uniform = material.getUniform(webglUniform.name);

            if (

                !uniform ||
                uniform.needsUpdate === false ||
                uniform.value === undefined

            ) {

                continue;

            }

            let value = uniform.value;

            if (value instanceof Texture) {

                const unit = this.state.allocateTextureUnits();
                this.state.activeTexture(unit);

                this.uploadTextureToGPU(value);

                value = unit;

            }

            webglUniform.set(value);

        }

    }

    private uploadTextureToGPU(texture: Texture, target = this.gl.TEXTURE_2D): void {

        let webglTexture = this.cache.getTexture(texture);

        if (webglTexture === undefined) {

            webglTexture = this.cache.acquireTexture(texture);
            this.state.bindTexture(webglTexture);

            const levels = 1;						// 贴图级别
            const format = this.gl.RGBA8;			// 纹理格式
            const width = texture.image.width;		// 宽度
            const height = texture.image.height;	// 高度

            this.gl.texStorage2D(target, levels, format, width, height);

            texture.needsUpdate = true;

        }

        if (texture.needsUpdate === true) {

            this.state.bindTexture(webglTexture);

            this.gl.texParameteri(target, this.gl.TEXTURE_WRAP_S, texture.wrapS);
            this.gl.texParameteri(target, this.gl.TEXTURE_WRAP_T, texture.wrapT);
            this.gl.texParameteri(target, this.gl.TEXTURE_MAG_FILTER, texture.magFilter);
            this.gl.texParameteri(target, this.gl.TEXTURE_MIN_FILTER, texture.minFilter);

            const level = 0;					    // 贴图级别
            const xoffset = 0;					    // x 偏移
            const yoffset = 0;					    // y 偏移
            const format = this.gl.RGBA;			// 纹理格式
            const type = this.gl.UNSIGNED_BYTE;		// 数据类型

            this.gl.texSubImage2D(target, level, xoffset, yoffset, format, type, texture.image);
            this.gl.generateMipmap(target);

            texture.needsUpdate = false;

        } else {

            this.state.bindTexture(webglTexture);

        }

    }

    private renderBuffer(object: RenderObject): void {

        const geometry = object.geometry as Geometry;
        const group = object.group;

        let start = 0, count = Infinity;

        if (group) {

            start = group.start;
            count = group.count;

        }

        if (geometry.indices) {

            const indices = geometry.indices;

            start = Math.max(start, 0);
            count = Math.min(count, indices.count);

            const buffer = this.cache.acquireBuffer(indices);
            this.state.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);

            const offset = start * indices.array.BYTES_PER_ELEMENT;
            this.gl.drawElements(this.gl.TRIANGLES, count, indices.dataType, offset);

        } else if (geometry.position) {

            const position = geometry.position;

            start = Math.max(start, 0);
            count = Math.min(count, position.count);

            this.gl.drawArrays(this.gl.TRIANGLES, start, count);

        }

    }

}
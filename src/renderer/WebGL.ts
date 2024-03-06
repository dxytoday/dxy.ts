import { Material } from "../materials/Material";
import { Attribute } from "../modules/Attribute";
import { Geometry } from "../modules/Geometry";
import { CubeTexture, Texture } from "../modules/Texture";
import { Camera } from "../objects/Camera";
import { Mesh } from "../objects/Mesh";
import { Scene } from "../objects/Scene";
import { TRSObject } from "../objects/TRSObject";
import { Color } from "../structs/Color";
import { RenderItem, WebGLCache } from "./WebGLCache";
import { WebGLState } from "./WebGLState";
import { TextureUniform } from "./WebGLUniform";

class Helper {

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

        this.gl = Helper.getWebGL2(canvas);

        this.cache = new WebGLCache(this);
        this.state = new WebGLState(this);

    }

    public render(scene: Scene, camera: Camera): void {

        const gl = this.gl;

        camera.updateMatrix();
        scene.updateLights(camera);

        const renderList: RenderItem[] = [];
        this.projectObject(scene, camera, renderList);

        this.renderBackground(scene, renderList);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        this.renderObjects(renderList, scene, camera);

        this.cache.freeRenderItem(renderList);

    }

    private projectObject(object: TRSObject, camera: Camera, renderList: RenderItem[]): void {

        if (!object.visible) {

            return;

        }

        object.updateMatrix();

        if (object instanceof Mesh && camera.frustumCulling(object)) {

            object.updateModelViewMatrix(camera.viewMatrix);

            const geometry = object.geometry;

            if (Array.isArray(object.material)) {

                const materials = object.material;
                const renderGroups = geometry.groups;

                for (const group of renderGroups) {

                    const material = materials[group.materialIndex];

                    const item = this.cache.mallocRenderItem(object, geometry, material, group);
                    renderList.push(item);

                }

            } else {

                const item = this.cache.mallocRenderItem(object, geometry, object.material);
                renderList.push(item);

            }

        }

        for (const child of object.children) {

            this.projectObject(child, camera, renderList);

        }

    }

    private renderBackground(scene: Scene, renderList: RenderItem[]): void {

        if (scene.background instanceof Color) {

            this.state.setClearColor(scene.background.r, scene.background.g, scene.background.b);

        } else if (scene.background instanceof Mesh) {

            const item = this.cache.mallocRenderItem(

                scene.background,
                scene.background.geometry,
                scene.background.material as Material

            );

            renderList.unshift(item);

        }

    }

    private renderObjects(renderList: RenderItem[], scene: Scene, camera: Camera): void {

        for (const item of renderList) {

            const material = item.material as Material;
            const program = this.cache.acquireProgram(material);
            item.program = program;

            this.state.useProgram(program)

            this.bindGeometry(item);
            this.applyMaterial(item, scene, camera);
            this.renderBuffer(item);

        }

    }

    private bindGeometry(item: RenderItem): void {

        const geometry = item.geometry as Geometry;
        const program = item.program as WebGLProgram;

        const vao = this.cache.acquireVertexArray(geometry);

        this.state.bindVertexArray(vao);

        const webglAttributes = this.cache.acquireAttributes(program);

        for (const webglAttribute of webglAttributes) {

            const attribute = geometry.getAttribute(webglAttribute.name);

            if (!attribute) {

                webglAttribute.disable(vao);
                continue;

            }

            this.uploadAttributeToGPU(this.gl.ARRAY_BUFFER, attribute);

            webglAttribute.bind(attribute, vao);

        }

        if (geometry.indices !== undefined) {

            this.uploadAttributeToGPU(this.gl.ELEMENT_ARRAY_BUFFER, geometry.indices);

        }

    }

    private uploadAttributeToGPU(target: number, attribute: Attribute): void {

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

    private applyMaterial(item: RenderItem, scene: Scene, camera: Camera): void {

        const mesh = item.mesh as Mesh;
        const material = item.material as Material;

        material.onBeforRender(scene, mesh, camera);

        const frontFaceCW = mesh.worldMatrix.determinant() < 0;
        this.state.setFrontFace(frontFaceCW);

        // this.state.depthTest(material.depthTest);
        this.state.backfaceCulling(material.backfaceCulling);

        this.uploadUniform(item);

    }

    private uploadUniform(item: RenderItem): void {

        const material = item.material as Material;
        const program = item.program as WebGLProgram;

        this.state.resetTextureUnits();

        const webglUniforms = this.cache.acquireUniforms(program);

        for (const webglUniform of webglUniforms) {

            const uniform = material.getUniform(webglUniform.name);

            if (webglUniform instanceof TextureUniform) {

                const unit = this.state.allocateTextureUnits();

                if (uniform && uniform.value) {

                    this.state.activeTexture(unit);
                    this.uploadTextureToGPU(uniform.value);

                }

                webglUniform.set(unit);

            } else if (uniform) {

                webglUniform.set(uniform.value);

            }

        }

    }

    private uploadTextureToGPU(texture: Texture): void {

        let webglTexture = this.cache.getTexture(texture);

        if (texture instanceof CubeTexture && texture.images && texture.images.length >= 6) {

            const target = this.gl.TEXTURE_CUBE_MAP;

            if (!webglTexture) {

                webglTexture = this.cache.acquireTexture(texture);
                this.state.bindTexture(target, webglTexture);

                const levels = 1;						// 贴图级别
                const format = this.gl.RGBA8;			// 纹理格式
                const width = texture.images[0].width;		// 宽度
                const height = texture.images[0].height;	// 高度

                this.gl.texStorage2D(target, levels, format, width, height);

                texture.needsUpdate = true;

            }

            if (texture.needsUpdate === true) {

                this.state.bindTexture(target, webglTexture);

                this.gl.texParameteri(target, this.gl.TEXTURE_WRAP_S, texture.wrapS);
                this.gl.texParameteri(target, this.gl.TEXTURE_WRAP_T, texture.wrapT);
                this.gl.texParameteri(target, this.gl.TEXTURE_MAG_FILTER, texture.magFilter);
                this.gl.texParameteri(target, this.gl.TEXTURE_MIN_FILTER, texture.minFilter);

                const pxTarget = this.gl.TEXTURE_CUBE_MAP_POSITIVE_X;
                const level = 0;					    // 贴图级别
                const xoffset = 0;					    // x 偏移
                const yoffset = 0;					    // y 偏移
                const format = this.gl.RGBA;			// 纹理格式
                const type = this.gl.UNSIGNED_BYTE;		// 数据类型

                for (let ii = 0; ii < 6; ii++) {

                    this.gl.texSubImage2D(pxTarget + ii, level, xoffset, yoffset, format, type, texture.images[ii]);

                }

                this.gl.generateMipmap(target);

                texture.needsUpdate = false;

            } else {

                this.state.bindTexture(target, webglTexture);

            }

        } else if (texture instanceof Texture && texture.image) {

            const target = this.gl.TEXTURE_2D;

            if (!webglTexture) {

                webglTexture = this.cache.acquireTexture(texture);
                this.state.bindTexture(target, webglTexture);

                const levels = 1;						// 贴图级别
                const format = this.gl.RGBA8;			// 纹理格式
                const width = texture.image.width;		// 宽度
                const height = texture.image.height;	// 高度

                this.gl.texStorage2D(target, levels, format, width, height);

                texture.needsUpdate = true;

            }

            if (texture.needsUpdate === true) {

                this.state.bindTexture(target, webglTexture);

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

                this.state.bindTexture(target, webglTexture);

            }

        }

    }

    private renderBuffer(item: RenderItem): void {

        const geometry = item.geometry as Geometry;
        const group = item.group;

        let start = -Infinity, count = Infinity;

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
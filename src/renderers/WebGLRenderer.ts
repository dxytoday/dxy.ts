import { Material } from "../materials/Material";
import { Attribute } from "../modules/Attribute";
import { Geometry } from "../modules/Geometry";
import { Camera } from "../cameras/Camera";
import { Mesh } from "../objects/Mesh";
import { Scene } from "../objects/Scene";
import { TRSObject } from "../modules/TRSObject";
import { WebGLState } from "./webgl/WebGLState";
import { TextureUniform, WebGLUniform } from "./webgl/WebGLUniform";
import { Constants } from "../Constants";
import { Texture } from "../textures/Texture";
import { CubeTexture } from "../textures/CubeTexture";
import { WebGLAttribute } from "./webgl/WebGLAttribute";
import { ImageTexture } from "../textures/ImageTexture";
import { Color } from "../math/Color";
import { Shadow } from "../lights/Shadow";
import { DataTexture } from "../textures/DataTexture";
import { WebGLCache } from "./webgl/WebGLCache";

abstract class Helper {

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

        const context = canvas.getContext('webgl2', Helper.attributes);

        if (!context) {

            throw new Error('DXY.WebGLRenderer : 当前环境不支持 webgl2 . ');

        }

        return context as WebGL2RenderingContext;

    }

    public static createTexture(

        that: WebGLRenderer,
        target: number,
        texture: Texture,
        image: TexImage,

    ): WebGLTexture {

        const webglTexture = that.cache.acquireTexture(texture);

        that.state.bindTexture(target, webglTexture);

        const levels = 1;				// 贴图级别
        const format = that.gl.RGBA8;	// 纹理格式
        const width = image.width;		// 宽度
        const height = image.height;	// 高度

        that.gl.texStorage2D(target, levels, format, width, height);

        texture.needsUpdate = true;

        return webglTexture;

    }

    public static setTextureParameters(

        that: WebGLRenderer,
        target: number,
        texture: Texture,

    ): void {

        that.gl.texParameteri(target, that.gl.TEXTURE_WRAP_S, texture.wrapS);
        that.gl.texParameteri(target, that.gl.TEXTURE_WRAP_T, texture.wrapT);
        that.gl.texParameteri(target, that.gl.TEXTURE_MAG_FILTER, texture.magFilter);
        that.gl.texParameteri(target, that.gl.TEXTURE_MIN_FILTER, texture.minFilter);

    }

    public static updateTexture(

        that: WebGLRenderer,
        target: number,
        image: TexImage,

    ): void {

        const level = 0;					    // 贴图级别
        const xoffset = 0;					    // x 偏移
        const yoffset = 0;					    // y 偏移
        const format = that.gl.RGBA;			// 纹理格式
        const type = that.gl.UNSIGNED_BYTE;		// 数据类型

        that.gl.texSubImage2D(target, level, xoffset, yoffset, format, type, image);

    }

}

export class WebGLRenderer {

    public readonly gl: WebGL2RenderingContext;
    public readonly state: WebGLState;
    public readonly cache: WebGLCache;

    private readonly renderList: RenderList;

    public constructor(canvas: HTMLCanvasElement) {

        this.gl = Helper.getWebGL2(canvas);
        this.state = new WebGLState(this.gl);
        this.cache = new WebGLCache(this.gl);

        this.renderList = { opaque: [], transparent: [] };

    }

    public setSize(width: number, height: number): void {

        this.state.setViewport(0, 0, width, height);

    }

    public render(scene: Scene, camera: Camera): void {

        scene.updateMatrix();
        camera.updateMatrix();

        scene.updateLights(camera);

        this.projectObject(scene, camera);

        this.renderShadow(scene);

        this.renderBackground(scene);

        this.renderObjects(scene, camera);

        this.cache.releaseRenderItem(this.renderList.opaque);
        this.cache.releaseRenderItem(this.renderList.transparent);

    }

    private projectObject(object: TRSObject, camera: Camera): void {

        if (!object.visible) {

            return;

        }

        if (object instanceof Mesh && camera.frustumCulling(object)) {

            const geometry = object.geometry;

            if (Array.isArray(object.material)) {

                const materials = object.material;
                const renderGroups = geometry.groups;

                for (const group of renderGroups) {

                    const material = materials[group.materialIndex];

                    if (!material) {

                        continue;

                    }

                    const item = this.cache.mallocRenderItem(object, geometry, material, group);

                    if (material.transparent) {

                        this.renderList.transparent.push(item);

                    } else {

                        this.renderList.opaque.push(item);

                    }

                }

            } else {

                const item = this.cache.mallocRenderItem(object, geometry, object.material);

                if (object.material.transparent) {

                    this.renderList.transparent.push(item);

                } else {

                    this.renderList.opaque.push(item);

                }

            }

        }

        for (const child of object.children) {

            this.projectObject(child, camera);

        }

    }

    private renderShadow(scene: Scene): void {

        const gl = this.gl;
        const light = scene.directionalLight;
        const shadow = light.shadow;

        shadow.updateShadowMatrix(light);

        let frameBuffer = this.cache.getFrameBuffer(shadow);

        if (!frameBuffer) {

            frameBuffer = this.cache.acquireFrameBuffer(shadow);
            this.state.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

            let texture = this.cache.getTexture(shadow.texture);

            if (!texture) {

                texture = this.cache.acquireTexture(shadow.texture);

            }

            this.state.bindTexture(gl.TEXTURE_2D, texture);

            Helper.setTextureParameters(this, gl.TEXTURE_2D, shadow.texture);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, shadow.size, shadow.size, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, texture, 0);

            // 注意：帧缓冲区和深度纹理绑定之后要随即将深度纹理从纹理单元解绑
            // 目的在于防止后续的渲染操作影响到深度纹理中的内容
            this.state.bindTexture(gl.TEXTURE_2D, null);

        } else {

            this.state.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

        }

        const viewport = this.state.viewport.clone();

        this.state.setViewport(0, 0, shadow.size, shadow.size);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        this.renderObjectShadow(scene, shadow, scene);

        this.state.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.state.setViewport(viewport.x, viewport.y, viewport.z, viewport.w);

    }

    private renderObjectShadow(scene: Scene, shadow: Shadow, object: TRSObject): void {

        if (!object.visible) {

            return;

        }

        if (object instanceof Mesh && shadow.camera.frustumCulling(object)) {

            const geometry = object.geometry;
            const material = object.material;

            if (Array.isArray(material)) {

                const renderGroups = geometry.groups;

                for (const group of renderGroups) {

                    if (!material[group.materialIndex]) {

                        continue;

                    }

                    this.renderObject(scene, shadow.camera, object, geometry, shadow.material, group);

                }

            } else {

                this.renderObject(scene, shadow.camera, object, geometry, shadow.material);

            }

        }

        for (const child of object.children) {

            this.renderObjectShadow(scene, shadow, child);

        }

    }

    private renderBackground(scene: Scene): void {

        const background = scene.getBackground();

        if (background instanceof Color) {

            this.state.setClearColor(background.r, background.g, background.b);

        }

        this.gl.clear(Constants.CLEAR_MASK);

        if (background instanceof Mesh) {

            const item = this.cache.mallocRenderItem(background, background.geometry, background.material as Material);
            this.renderList.opaque.unshift(item);

        }

    }

    private renderObjects(scene: Scene, camera: Camera): void {

        const opaque = this.renderList.opaque;
        const transparent = this.renderList.transparent;

        for (const renderItem of opaque) {

            this.renderObject(

                scene,
                camera,
                renderItem.mesh as Mesh,
                renderItem.geometry as Geometry,
                renderItem.material as Material,
                renderItem.group

            );

        }

        for (const renderItem of transparent) {

            this.renderObject(

                scene,
                camera,
                renderItem.mesh as Mesh,
                renderItem.geometry as Geometry,
                renderItem.material as Material,
                renderItem.group

            );

        }

    }

    private renderObject(

        scene: Scene,
        camera: Camera,
        mesh: Mesh,
        geometry: Geometry,
        material: Material,
        group?: RenderGroup

    ): void {

        material.onBeforRender(scene, mesh, camera);

        const program = this.cache.acquireProgram(material);
        const attributes = this.cache.acquireAttributes(program);
        const uniforms = this.cache.acquireUniforms(program);

        this.state.useProgram(program);

        const frontFaceCW = mesh.worldMatrix.determinant() < 0;
        this.state.setFrontFace(frontFaceCW);

        this.bindGeometry(geometry, attributes);
        this.applyMaterial(material, uniforms);
        this.renderBuffer(geometry, group);

    }

    private bindGeometry(geometry: Geometry, webglAttributes: WebGLAttribute[]): void {

        const vao = this.cache.acquireVertexArray(geometry);
        this.state.bindVertexArray(vao);

        for (const webglAttribute of webglAttributes) {

            const attribute = geometry.getAttribute(webglAttribute.name);

            if (!attribute) {

                webglAttribute.disable(vao);
                continue;

            }

            const buffer = this.uploadAttributeToGPU(this.gl.ARRAY_BUFFER, attribute);
            webglAttribute.bind(attribute, vao, buffer);

        }

        if (geometry.indices !== undefined) {

            this.uploadAttributeToGPU(this.gl.ELEMENT_ARRAY_BUFFER, geometry.indices);

        }

    }

    private uploadAttributeToGPU(target: number, attribute: Attribute): WebGLBuffer {

        let buffer = this.cache.getBuffer(attribute);

        if (!buffer) {

            buffer = this.cache.acquireBuffer(attribute);

            this.state.bindBuffer(target, buffer);
            this.gl.bufferData(target, attribute.array, this.gl.STATIC_DRAW);

            attribute.needsUpdate = false;

        }

        this.state.bindBuffer(target, buffer);

        if (attribute.needsUpdate) {

            this.gl.bufferSubData(target, 0, attribute.array);

            attribute.needsUpdate = false;

        }

        return buffer;

    }

    private applyMaterial(material: Material, webglUniforms: WebGLUniform[]): void {

        this.state.backfaceCulling(material.backfaceCulling);
        this.state.resetTextureUnits();

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

                webglTexture = Helper.createTexture(this, target, texture, texture.images[0]);

            }

            this.state.bindTexture(target, webglTexture);

            if (texture.needsUpdate) {

                Helper.setTextureParameters(this, target, texture);

                const pxTarget = this.gl.TEXTURE_CUBE_MAP_POSITIVE_X;

                for (let ii = 0; ii < 6; ii++) {

                    Helper.updateTexture(this, pxTarget + ii, texture.images[ii]);

                }

                this.gl.generateMipmap(target);

                texture.needsUpdate = false;

            }

            return;

        }

        if (texture instanceof ImageTexture && texture.image) {

            const target = this.gl.TEXTURE_2D;

            if (!webglTexture) {

                webglTexture = Helper.createTexture(this, target, texture, texture.image);

            }

            this.state.bindTexture(target, webglTexture);

            if (texture.needsUpdate) {

                Helper.setTextureParameters(this, target, texture);
                Helper.updateTexture(this, target, texture.image);

                this.gl.generateMipmap(target);

                texture.needsUpdate = false;

            }

            return;

        }

        if (texture instanceof DataTexture && webglTexture) {

            this.state.bindTexture(this.gl.TEXTURE_2D, webglTexture);
            return;

        }

    }

    private renderBuffer(geometry: Geometry, group?: RenderGroup): void {

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

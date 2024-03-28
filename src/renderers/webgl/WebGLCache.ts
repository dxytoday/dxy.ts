import { Shadow } from "../../lights/Shadow";
import { Material } from "../../materials/Material";
import { Attribute } from "../../modules/Attribute";
import { Geometry } from "../../modules/Geometry";
import { Mesh } from "../../objects/Mesh";
import { Texture } from "../../textures/Texture";
import { WebGLRenderer } from "../WebGLRenderer";
import { WebGLAttribute } from "./WebGLAttribute";
import { WebGLUniform } from "./WebGLUniform";

class Helper {

    private static readonly renderItems: RenderItem[] = [];

    public static mallocRenderItem(

        mesh: Mesh,
        geometry: Geometry,
        material: Material,
        group?: RenderGroup

    ): RenderItem {

        const item = this.renderItems.shift() || {};

        item.mesh = mesh;
        item.geometry = geometry;
        item.material = material;
        item.group = group;

        return item;

    }

    public static releaseRenderItem(items: RenderItem[]): void {

        for (const item of items) {

            item.mesh = undefined;
            item.geometry = undefined;
            item.material = undefined;
            item.group = undefined;

            Helper.renderItems.push(item);

        }

        items.length = 0;

    }

    public static setLineNumber(source: string): string {

        function fn(lineContent: string, lineIndex: number) {

            return `${lineIndex + 1}: ${lineContent}`;

        }

        return source.split('\n').map(fn).join('\n');

    }

}

export class WebGLCache {

    private readonly frameBuffers = new Map<Shadow, WebGLFramebuffer>();
    private readonly textures = new Map<Texture, WebGLTexture>();

    private readonly programs = new Map<Function, WebGLProgram>();
    private readonly shaders = new Map<string, WebGLShader>();

    private readonly attributes = new Map<WebGLProgram, WebGLAttribute[]>();
    private readonly uniforms = new Map<WebGLProgram, WebGLUniform[]>();

    private readonly buffers = new Map<Attribute, WebGLBuffer>();
    private readonly vaos = new Map<Geometry, WebGLVertexArrayObject>();

    public constructor(

        private gl: WebGL2RenderingContext,

    ) { }

    public mallocRenderItem(mesh: Mesh, geometry: Geometry, material: Material, group?: RenderGroup): RenderItem {

        return Helper.mallocRenderItem(mesh, geometry, material, group);

    }

    public releaseRenderItem(items: RenderItem[]): void {

        Helper.releaseRenderItem(items);

    }

    public getFrameBuffer(shadow: Shadow): WebGLFramebuffer | undefined {

        return this.frameBuffers.get(shadow);

    }

    public acquireFrameBuffer(shadow: Shadow): WebGLFramebuffer {

        let frameBuffer = this.frameBuffers.get(shadow);

        if (!frameBuffer) {

            frameBuffer = this.gl.createFramebuffer() as WebGLFramebuffer;
            this.frameBuffers.set(shadow, frameBuffer);

        }

        return frameBuffer;

    }

    public getTexture(texture: Texture): WebGLTexture | undefined {

        return this.textures.get(texture);

    }

    public acquireTexture(texture: Texture): WebGLTexture {

        let webglTexture = this.textures.get(texture);

        if (webglTexture === undefined) {

            webglTexture = this.gl.createTexture() as WebGLTexture;
            this.textures.set(texture, webglTexture);

        }

        return webglTexture;

    }

    private acquireShader(source: string, type: number): WebGLShader {

        let shader = this.shaders.get(source);

        if (!shader) {

            shader = this.gl.createShader(type) as WebGLShader;

            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);

            const compiled: boolean = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);

            if (!compiled) {

                const reminder = 'DXY.WebGLCache : 编译着色器代码错误 .';
                const lastError = this.gl.getShaderInfoLog(shader);
                source = Helper.setLineNumber(source);

                throw new Error([reminder, lastError, source].join('\n'));

            }

            this.shaders.set(source, shader);

        }

        return shader;

    }

    public acquireProgram(material: Material): WebGLProgram {

        const materialClass: Function = material.constructor;

        let program = this.programs.get(materialClass);

        if (!program) {

            const vertexShader = this.acquireShader(material.vertexShader, this.gl.VERTEX_SHADER);
            const fragmentShader = this.acquireShader(material.fragmentShader, this.gl.FRAGMENT_SHADER);

            program = this.gl.createProgram() as WebGLProgram;

            this.gl.attachShader(program, vertexShader);
            this.gl.attachShader(program, fragmentShader);

            this.gl.linkProgram(program);

            const linked: boolean = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);

            if (!linked) {

                const reminder = 'DXY.WebGLCache : 链接着色器程序错误 . ';
                const lastError = this.gl.getProgramInfoLog(program);

                throw new Error([reminder, lastError].join('\n'));

            }

            this.programs.set(materialClass, program);

        }

        return program;

    }

    public acquireAttributes(program: WebGLProgram): WebGLAttribute[] {

        let attributes = this.attributes.get(program);

        if (!attributes) {

            attributes = [];

            const count: number = this.gl.getProgramParameter(program, this.gl.ACTIVE_ATTRIBUTES);

            for (let ii = 0; ii < count; ii++) {

                const info = this.gl.getActiveAttrib(program, ii) as WebGLActiveInfo;
                const location: number = this.gl.getAttribLocation(program, info.name);

                const attribute = new WebGLAttribute(this.gl, location, info.name);
                attributes.push(attribute);

            }

            this.attributes.set(program, attributes);

        }

        return attributes;

    }

    public acquireUniforms(program: WebGLProgram): WebGLUniform[] {

        let uniforms = this.uniforms.get(program);

        if (!uniforms) {

            uniforms = [];
            const count: number = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORMS);

            for (let ii = 0; ii < count; ii++) {

                const info = this.gl.getActiveUniform(program, ii) as WebGLActiveInfo;
                const location = this.gl.getUniformLocation(program, info.name) as WebGLUniformLocation;

                WebGLUniform.toUniforms(this.gl, info, location, uniforms);

            }

            this.uniforms.set(program, uniforms);

        }

        return uniforms;

    }

    public acquireVertexArray(geometry: Geometry): WebGLVertexArrayObject {

        let vao = this.vaos.get(geometry);

        if (vao === undefined) {

            vao = this.gl.createVertexArray() as WebGLVertexArrayObject;
            this.vaos.set(geometry, vao);

        }

        return vao;

    }

    public getBuffer(attribute: Attribute): WebGLBuffer | undefined {

        return this.buffers.get(attribute);

    }

    public acquireBuffer(attribute: Attribute): WebGLBuffer {

        let buffer = this.buffers.get(attribute);

        if (!buffer) {

            buffer = this.gl.createBuffer() as WebGLBuffer;
            this.buffers.set(attribute, buffer);

        }

        return buffer;

    }

}
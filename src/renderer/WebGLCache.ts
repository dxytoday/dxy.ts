import { Material } from "../materials/Material";
import { Attribute } from "../modules/Attribute";
import { EventParameters } from "../modules/EventObject";
import { Geometry, RenderGroup } from "../modules/Geometry";
import { Texture } from "../modules/Texture";
import { Mesh } from "../objects/Mesh"
import { WebGL } from "./WebGL";
import { WebGLAttribute } from "./WebGLAttribute";
import { WebGLUniform } from "./WebGLUniform";

export type RenderItem = {

    mesh?: Mesh;
    geometry?: Geometry;
    material?: Material;
    group?: RenderGroup;

    program?: WebGLProgram;

}

class WebGLCacheHelper {

    public static setLineNumber(source: string): string {

        function fn(lineContent: string, lineIndex: number) {

            return `${lineIndex + 1}: ${lineContent}`;

        }

        return source.split('\n').map(fn).join('\n');

    }

}

export class WebGLCache {

    private static readonly renderItems: RenderItem[] = [];

    private readonly programs = new Map<string, WebGLProgram>();
    private readonly shaders = new Map<string, WebGLShader>();

    private readonly attributes = new Map<WebGLProgram, WebGLAttribute[]>();
    private readonly uniforms = new Map<WebGLProgram, WebGLUniform[]>();

    private readonly buffers = new Map<Attribute, WebGLBuffer>();
    private readonly textures = new Map<Texture, WebGLTexture>();
    private readonly vaos = new Map<Geometry, WebGLVertexArrayObject>();

    public constructor(

        private renderer: WebGL,
        private gl = renderer.gl,

    ) { }

    public mallocRenderItem(mesh: Mesh, geometry: Geometry, material: Material, group?: RenderGroup): RenderItem {

        const item = WebGLCache.renderItems.shift() || {};

        item.mesh = mesh;
        item.geometry = geometry;
        item.material = material;
        item.group = group;

        return item;

    }

    public freeRenderItem(items: RenderItem[]): void {

        for (const item of items) {

            item.mesh = undefined;
            item.geometry = undefined;
            item.material = undefined;
            item.group = undefined;

            item.program = undefined;

            WebGLCache.renderItems.push(item);

        }

        items.length = 0;

    }

    public acquireProgram(material: Material): WebGLProgram {

        const key = `${material.vertexShader}-${material.fragmentShader}`;

        let program = this.programs.get(key);

        if (!program) {

            const vertexShader = this.acquireShader(material.vertexShader, this.gl.VERTEX_SHADER);
            const fragmentShader = this.acquireShader(material.fragmentShader, this.gl.FRAGMENT_SHADER);

            program = this.gl.createProgram() as WebGLProgram;

            this.gl.attachShader(program, vertexShader);
            this.gl.attachShader(program, fragmentShader);

            this.gl.linkProgram(program);

            const linked: boolean = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);

            if (!linked) {

                const reminder = 'Dxy.WebGLCache : 链接着色器程序错误 . ';
                const lastError = this.gl.getProgramInfoLog(program);

                throw new Error([reminder, lastError].join('\n'));

            }

            this.programs.set(key, program);

            material.on('dispose', this.onMaterialDispose, this);

        }

        return program;

    }

    private onMaterialDispose(parameters: EventParameters): void {

        const material = parameters.source as Material;
        material.off('dispose', this.onMaterialDispose);



    }

    private acquireShader(source: string, type: number): WebGLShader {

        let shader = this.shaders.get(source);

        if (!shader) {

            shader = this.gl.createShader(type) as WebGLShader;

            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);

            const compiled: boolean = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);

            if (!compiled) {

                const reminder = 'Dxy.WebGLCache.acquireShader : 编译着色器代码错误 .';
                const lastError = this.gl.getShaderInfoLog(shader);
                source = WebGLCacheHelper.setLineNumber(source);

                throw new Error([reminder, lastError, source].join('\n'));

            }

            this.shaders.set(source, shader);

        }

        return shader;

    }

    public acquireAttributes(program: WebGLProgram): WebGLAttribute[] {

        let attributes = this.attributes.get(program);

        if (!attributes) {

            attributes = [];

            const count: number = this.gl.getProgramParameter(program, this.gl.ACTIVE_ATTRIBUTES);

            for (let ii = 0; ii < count; ii++) {

                const info = this.gl.getActiveAttrib(program, ii) as WebGLActiveInfo;
                const location: number = this.gl.getAttribLocation(program, info.name);

                const attribute = new WebGLAttribute(this.renderer, location, info.name);
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

    public getBuffer(attribute: Attribute): WebGLBuffer {

        return this.buffers.get(attribute) as WebGLBuffer;

    }

    public acquireBuffer(attribute: Attribute): WebGLBuffer {

        let buffer = this.buffers.get(attribute);

        if (!buffer) {

            buffer = this.gl.createBuffer() as WebGLBuffer;

            attribute.on('dispose', this.onAttributeDispose, this);

            this.buffers.set(attribute, buffer);

        }

        return buffer;

    }

    private onAttributeDispose(parameters: EventParameters): void {

        const attribute = parameters.source as Attribute;
        attribute.off('dispose', this.onAttributeDispose);

        const buffer = this.buffers.get(attribute);

        if (!buffer) {

            return;

        }

        this.buffers.delete(attribute);
        this.gl.deleteBuffer(buffer);

    }

    public getTexture(texture: Texture): WebGLTexture {

        return this.textures.get(texture) as WebGLTexture;

    }

    public acquireTexture(texture: Texture): WebGLTexture {

        let webglTexture = this.textures.get(texture);

        if (webglTexture === undefined) {

            webglTexture = this.gl.createTexture() as WebGLTexture;

            texture.on('dispose', this.onTextureDispose, this);

            this.textures.set(texture, webglTexture);

        }

        return webglTexture;

    }

    private onTextureDispose(parameters: EventParameters): void {

        const texture = parameters.source as Texture;
        texture.off('dispose', this.onTextureDispose);

        const webglTexture = this.textures.get(texture);

        if (!webglTexture) {

            return;

        }

        this.textures.delete(texture);
        this.gl.deleteTexture(webglTexture);

    }

    public acquireVertexArray(geometry: Geometry): WebGLVertexArrayObject {

        let vao = this.vaos.get(geometry);

        if (vao === undefined) {

            vao = this.gl.createVertexArray() as WebGLVertexArrayObject;

            geometry.on('dispose', this.onGeometryDispose, this);

            this.vaos.set(geometry, vao);

        }

        return vao;

    }

    private onGeometryDispose(parameters: EventParameters): void {

        const geometry = parameters.source as Geometry;
        geometry.off('dispose', this.onGeometryDispose);

        const vao = this.vaos.get(geometry);

        if (!vao) {

            return;

        }

        this.vaos.delete(geometry);

        for (const [, attributes] of this.attributes) {

            for (const attribute of attributes) {

                attribute.onDeleteVAO(vao);

            }

        }

        this.gl.deleteVertexArray(vao);

    }

}
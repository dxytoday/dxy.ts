import { Attribute } from "../objects/modules/Attribute";
import { Geometry } from "../objects/modules/Geometry";
import { Texture } from "../objects/modules/Texture";
import { WebGL } from "./WebGL";
import { WebGLAttribute } from "./WebGLAttribute";
import { WebGLObject } from "./WebGLObject";
import { WebGLUniform, WebGLUniformFactory } from "./WebGLUniform";

export class WebGLCache {

	private static readonly discardObjects: WebGLObject[] = [];

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

	public acquireObject(): WebGLObject {

		let object = WebGLCache.discardObjects.shift();

		if (object === undefined) {

			object = new WebGLObject();

		}

		return object;

	}

	public recoveryObjects(objects: WebGLObject[]): void {

		for (const object of objects) {

			object.discard();

			WebGLCache.discardObjects.push(object);

		}

		objects.length = 0;

	}

	public acquireProgram(vertexSource: string, fragmentSource: string): WebGLProgram {

		const key = `${vertexSource}-${fragmentSource}`;

		let program = this.programs.get(key);

		if (program === undefined) {

			const vertexShader = this.acquireShader(vertexSource, this.gl.VERTEX_SHADER);
			const fragmentShader = this.acquireShader(fragmentSource, this.gl.FRAGMENT_SHADER);

			program = this.gl.createProgram();

			this.gl.attachShader(program, vertexShader);
			this.gl.attachShader(program, fragmentShader);

			this.gl.linkProgram(program);

			const linked: boolean = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);

			if (!linked) {

				const reminder = 'Dxy.WebGLCache.acquireProgram : 链接着色器程序错误 .';
				const lastError = this.gl.getProgramInfoLog(program);

				throw new Error([reminder, lastError].join('\n'));

			}

			this.programs.set(key, program);

		}

		return program;

	}

	private acquireShader(source: string, type: number): WebGLShader {

		let shader = this.shaders.get(source);

		if (shader === undefined) {

			shader = this.gl.createShader(type);

			this.gl.shaderSource(shader, source);
			this.gl.compileShader(shader);

			const compiled: boolean = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);

			if (!compiled) {

				const reminder = 'Dxy.WebGLCache.acquireShader : 编译着色器代码错误 .';
				const lastError = this.gl.getShaderInfoLog(shader);
				source = this.setLineNumber(source);

				throw new Error([reminder, lastError, source].join('\n'));

			}

			this.shaders.set(source, shader);

		}

		return shader;

	}

	private setLineNumber(source: string): string {

		function fn(lineContent: string, lineIndex: number) {

			return `${lineIndex + 1}: ${lineContent}`;

		}

		return source.split('\n').map(fn).join('\n');

	}

	public acquireAttributes(program: WebGLProgram): WebGLAttribute[] {

		let attributes = this.attributes.get(program);

		if (attributes === undefined) {

			attributes = [];

			const count: number = this.gl.getProgramParameter(program, this.gl.ACTIVE_ATTRIBUTES);

			for (let ii = 0; ii < count; ii++) {

				const info: WebGLActiveInfo = this.gl.getActiveAttrib(program, ii);
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

		if (uniforms === undefined) {

			uniforms = [];

			const count: number = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORMS);

			for (let ii = 0; ii < count; ii++) {

				const info: WebGLActiveInfo = this.gl.getActiveUniform(program, ii);
				const location: WebGLUniformLocation = this.gl.getUniformLocation(program, info.name);

				WebGLUniformFactory.toUniforms(this.gl, info, location, uniforms);

			}

			this.uniforms.set(program, uniforms);

		}

		return uniforms;

	}

	public getBuffer(attribute: Attribute): WebGLBuffer {

		return this.buffers.get(attribute);

	}

	public acquireBuffer(attribute: Attribute): WebGLBuffer {

		let buffer = this.buffers.get(attribute);

		if (buffer === undefined) {

			buffer = this.gl.createBuffer();

			attribute.addEventListener(Attribute.events.dispose, this.onAttributeDispose, this);

			this.buffers.set(attribute, buffer);

		}

		return buffer;

	}

	private onAttributeDispose(event: AnyEvent): void {

		const attribute = event.source as Attribute;

		attribute.removeEventListener(Attribute.events.dispose, this.onAttributeDispose);

		const buffer = this.buffers.get(attribute);

		if (buffer === undefined) {

			return;

		}

		this.buffers.delete(attribute);

		this.gl.deleteBuffer(buffer);

	}

	public getTexture(texture: Texture): WebGLTexture {

		return this.textures.get(texture);

	}

	public acquireTexture(texture: Texture): WebGLTexture {

		let webglTexture = this.textures.get(texture);

		if (webglTexture === undefined) {

			webglTexture = this.gl.createTexture();

			texture.addEventListener(Texture.events.dispose, this.onTextureDispose, this);

			this.textures.set(texture, webglTexture);

		}

		return webglTexture;

	}

	private onTextureDispose(event: AnyEvent): void {

		const texture = event.source as Texture;

		texture.removeEventListener(Texture.events.dispose, this.onTextureDispose);

		const webglTexture = this.textures.get(texture);

		if (webglTexture === undefined) {

			return;

		}

		this.textures.delete(texture);

		this.gl.deleteTexture(webglTexture);

	}

	public acquireVertexArray(geometry: Geometry): WebGLVertexArrayObject {

		let vao = this.vaos.get(geometry);

		if (vao === undefined) {

			vao = this.gl.createVertexArray();

			geometry.addEventListener(Geometry.events.dispose, this.onGeometryDispose, this);

			this.vaos.set(geometry, vao);

		}

		return vao;

	}

	private onGeometryDispose(event: AnyEvent): void {

		const geometry = event.source as Geometry;

		geometry.removeEventListener(Geometry.events.dispose, this.onGeometryDispose);

		const vao = this.vaos.get(geometry);

		if (vao === undefined) {

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

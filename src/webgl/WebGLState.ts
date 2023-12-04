import { LoggerProxy } from "../bases/LoggerProxy";
import { Vector4 } from "../struct/Vector4";
import { WebGL } from "./WebGL";

export class WebGLState {

	public readonly currClearColor = new Vector4(0, 0, 0, 0);
	public readonly currViewport = new Vector4(0, 0, 0, 0);

	public currProgram: WebGLProgram;

	public currArrayBuffer: WebGLBuffer;
	public currElementArrayBuffer: WebGLBuffer;

	private currFrontFace = false;

	public readonly maxTextures: number;
	private textureUnits = 0;
	private currTextureUnit = 0;
	private currTexture2D: WebGLTexture;

	public currVAO: WebGLVertexArrayObject;

	private readonly stateCache = new Map<number, boolean>();

	public constructor(

		private renderer: WebGL,
		private gl = renderer.gl,

	) {

		this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

		gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);

		this.clearColor(0, 0, 0, 1);

		gl.clearDepth(1);
		gl.clearStencil(0);
		gl.depthFunc(gl.LEQUAL);

	}

	public clearColor(r: number, g: number, b: number, a: number): void {

		if (

			this.currClearColor.x === r &&
			this.currClearColor.y === g &&
			this.currClearColor.z === b &&
			this.currClearColor.w === a

		) {

			return;

		}

		this.currClearColor.set(r, g, b, a);
		this.gl.clearColor(r, g, b, a);

	}

	public viewport(x: number, y: number, width: number, height: number): void {

		if (

			this.currViewport.x === x &&
			this.currViewport.y === y &&
			this.currViewport.z === width &&
			this.currViewport.w === height

		) {

			return;
		}

		this.currViewport.set(x, y, width, height);
		this.gl.viewport(x, y, width, height);

	}

	public useProgram(program: WebGLProgram): void {

		if (this.currProgram === program) {

			return;

		}

		this.currProgram = program;

		this.gl.useProgram(program);

	}

	public bindBuffer(bind: number, buffer: WebGLBuffer): void {

		if (bind === this.gl.ARRAY_BUFFER) {

			if (this.currArrayBuffer === buffer) {

				return;

			}

			this.currArrayBuffer = buffer;

		}

		if (bind === this.gl.ELEMENT_ARRAY_BUFFER) {

			if (this.currElementArrayBuffer === buffer) {

				return;

			}

			this.currElementArrayBuffer = buffer;

		}

		this.gl.bindBuffer(bind, buffer);

	}

	public resetTextureUnits() {

		this.textureUnits = 0;

	}

	public allocateTextureUnits(): number {

		const textureUnits = this.textureUnits;

		if (textureUnits >= this.maxTextures) {

			LoggerProxy.warn(`Dxy.WebGLState.allocateTextureUnits : 纹理单元超过了最大限制 ${textureUnits} .`);

		}

		this.textureUnits++;

		return textureUnits;

	}

	public bindTexture(texture: WebGLTexture): void {

		if (this.currTexture2D === texture) {

			return;

		}

		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

		this.currTexture2D = texture;

	}

	public activeTexture(unit: number): void {

		if (this.currTextureUnit === unit) {

			return;

		}

		this.currTextureUnit = unit;

		this.gl.activeTexture(this.gl.TEXTURE0 + unit);

	}

	public frontFace(isCW: boolean): void {

		if (this.currFrontFace === isCW) {

			return;

		}

		this.currFrontFace = isCW;

		if (isCW) {

			this.gl.frontFace(this.gl.CW);

		} else {

			this.gl.frontFace(this.gl.CCW);

		}

	}

	public enable(id: number): void {

		if (this.stateCache.get(id)) {

			return;

		}

		this.gl.enable(id);

		this.stateCache.set(id, true);

	}

	public disable(id: number): void {

		if (!this.stateCache.get(id)) {

			return;

		}

		this.gl.disable(id);

		this.stateCache.set(id, false);

	}

	public depthTest(isEnable: boolean): void {

		if (isEnable === true) {

			this.enable(this.gl.DEPTH_TEST);

		} else if (isEnable === false) {

			this.disable(this.gl.DEPTH_TEST);

		}

	}

	public backfaceCulling(isEnable: boolean): void {

		if (isEnable === true) {

			this.enable(this.gl.CULL_FACE);
			this.gl.cullFace(this.gl.BACK);

		} else if (isEnable === false) {

			this.disable(this.gl.CULL_FACE);

		}

	}

	public bindVertexArray(vao: WebGLVertexArrayObject): void {

		if (this.currVAO === vao) {

			return;

		}

		this.currVAO = vao;

		this.gl.bindVertexArray(vao);

	}

}

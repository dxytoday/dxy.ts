import { Attribute } from "../objects/modules/Attribute";
import { WebGL } from "./WebGL";

export class WebGLAttribute {

	private readonly enableVAOs = new Set<WebGLVertexArrayObject>();
	private readonly pointerVAOs = new Map<WebGLVertexArrayObject, PointerInfo>();

	public constructor(

		renderer: WebGL,
		private location: number,
		public name: string,
		private gl = renderer.gl,
		private state = renderer.state,
		private cache = renderer.cache,

	) { }

	public isEnable(vao: WebGLVertexArrayObject): boolean {

		return this.enableVAOs.has(vao);

	}

	public enable(vao: WebGLVertexArrayObject): void {

		if (this.isEnable(vao) === true) {

			return;

		}

		this.state.bindVertexArray(vao);

		this.gl.enableVertexAttribArray(this.location);

		this.enableVAOs.add(vao);

	}

	public disable(vao: WebGLVertexArrayObject): void {

		if (this.isEnable(vao) === false) {

			return;

		}

		this.state.bindVertexArray(vao);

		this.gl.disableVertexAttribArray(this.location);

		this.enableVAOs.delete(vao);

	}

	public bind(attribute: Attribute): void {

		const buffer = this.cache.getBuffer(attribute);
		const vao = this.state.currVAO;

		let pointerInfo = this.pointerVAOs.get(vao);

		if (pointerInfo === undefined) {

			pointerInfo = {};
			this.pointerVAOs.set(vao, pointerInfo);

			this.enable(vao);

		}

		const itemSize = attribute.itemSize;
		const dataType = attribute.type;
		const normalized = attribute.normalized;

		if (

			pointerInfo.buffer === buffer &&
			pointerInfo.size === itemSize &&
			pointerInfo.type == dataType &&
			pointerInfo.normalized === normalized

		) {

			return;

		}

		pointerInfo.buffer = buffer;
		pointerInfo.size = itemSize;
		pointerInfo.type = dataType;
		pointerInfo.normalized = normalized;

		this.state.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

		this.gl.vertexAttribPointer(
			this.location,
			itemSize,
			dataType,
			normalized,
			0,
			0,
		);

	}

	public onDeleteVAO(vao: WebGLVertexArrayObject): void {

		if (this.enableVAOs.has(vao)) {

			this.enableVAOs.delete(vao);

		}

		if (this.pointerVAOs.has(vao)) {

			this.pointerVAOs.delete(vao);

		}

	}

}

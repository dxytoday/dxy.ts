import { Entity, InstancedEntity } from "../objects/Entity";
import { TRSNode } from "../objects/TRSNode";
import { Camera } from "../objects/camera/Camera";
import { Attribute } from "../objects/modules/Attribute";
import { WebGLCache } from "./WebGLCache";
import { WebGLState } from "./WebGLState";
import { ShaderFactory } from "./shader/ShaderFactory";
import { CanvasElement } from "../bases/CanvasElement";
import { WebGLObject } from "./WebGLObject";
import { Texture } from "../objects/modules/Texture";
import { AmbientLight } from "../objects/lights/AmbientLight";
import { SpotLight } from "../objects/lights/SpotLight";

export class WebGL {

	public gl: WebGL2RenderingContext;

	public state: WebGLState;
	public cache: WebGLCache;

	private readonly renderList: WebGLObject[] = [];

	public constructor(

		public element: CanvasElement,
		public camera: Camera,
		public ambientLight: AmbientLight,
		public spotLight: SpotLight,
		public scene: TRSNode,

	) {

		this.gl = this.element.getWebGLContext();

		this.state = new WebGLState(this);
		this.cache = new WebGLCache(this);

		this.element.addEventListener(CanvasElement.events.resize, this.onResize, this);

	}

	private onResize(): void {

		this.state.viewport(0, 0, this.element.width, this.element.height);

	}

	public setClearColor(r: number, g: number, b: number, a: number): void {

		this.state.clearColor(r, g, b, a);

	}

	public render(): void {

		const gl = this.gl;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

		this.projectObject(this.scene);
		this.renderObject(this.renderList);

		this.cache.recoveryObjects(this.renderList);

	}

	private projectObject(node: TRSNode): void {

		if (node.visible === false) {

			return;

		}

		node.updateWorldMatrix();

		if (node instanceof Entity) {

			node.updateModelViewMatrix(this.camera.viewMatrix);

			const geometry = node.geometry;

			if (Array.isArray(node.material)) {

				const materials = node.material;
				const groups = geometry.groups;

				for (const group of groups) {

					const material = materials[group.materialIndex];

					const object = this.cache.acquireObject();
					object.use(node, geometry, material, group);
					this.renderList.push(object);

				}

			} else {

				const object = this.cache.acquireObject();
				object.use(node, geometry, node.material);
				this.renderList.push(object);

			}

		}

		if (node instanceof InstancedEntity) {

			this.uploadAttributeToGPU(node.instanceMatrix);

			if (node.instanceColor !== undefined) {

				this.uploadAttributeToGPU(node.instanceColor);

			}

		}

		for (const child of node) {

			this.projectObject(child);

		}

	}

	private renderObject(object: WebGLObject | WebGLObject[]): void {

		if (Array.isArray(object)) {

			for (const each of object) {

				this.renderObject(each);

			}

			return;

		}

		const shaderSources = ShaderFactory.getShaderSources(object);
		const { vertex, fragment } = shaderSources;
		object.vertexSource = vertex;
		object.fragmentSource = fragment;

		const program = this.cache.acquireProgram(vertex, fragment);

		this.state.useProgram(program)

		object.program = program;

		this.applyMaterial(object);
		this.bindGeometry(object);
		this.renderBuffer(object);

	}

	private applyMaterial(object: WebGLObject): void {

		const { entity, material } = object;

		const frontFaceCW = entity.worldMatrix.determinant() < 0;
		this.state.frontFace(frontFaceCW);

		this.state.depthTest(material.depthTest);
		this.state.backfaceCulling(material.backfaceCulling);

		this.state.resetTextureUnits();

		this.uploadUniform(object);

	}

	private uploadUniform(object: WebGLObject): void {

		const { entity, material, program } = object;

		const webglUniforms = this.cache.acquireUniforms(program);

		for (const uniform of webglUniforms) {

			if (uniform.name === 'modelViewMatrix') {

				uniform.set(entity.modelViewMatrix);

			} else if (uniform.name === 'projectionMatrix') {

				uniform.set(this.camera.projectionMatrix);

			} else if (uniform.name === 'normalMatrix') {

				uniform.set(entity.normalMatrix);

			} else if (uniform.name === 'ambient') {

				uniform.set(this.ambientLight.color);

			} else if (uniform.name === 'light') {

				uniform.set(this.spotLight);

			} else if (uniform.name in material) {

				let value = material[uniform.name];

				if (value === undefined) {

					continue;

				}

				if (value instanceof Texture) {

					const unit = this.state.allocateTextureUnits();
					this.state.activeTexture(unit);

					this.uploadTextureToGPU(value);

					value = unit;

				}

				uniform.set(value);

			}

		}

	}

	private uploadTextureToGPU(texture: Texture, target = this.gl.TEXTURE_2D): void {

		const gl = this.gl;


		let webglTexture = this.cache.getTexture(texture);

		if (webglTexture === undefined) {

			webglTexture = this.cache.acquireTexture(texture);
			this.state.bindTexture(webglTexture);

			const levels = 1;						// 贴图级别
			const format = gl.RGBA8;				// 纹理格式
			const width = texture.image.width;		// 宽度
			const height = texture.image.height;	// 高度

			gl.texStorage2D(target, levels, format, width, height);

			texture.changed = true;

		}

		if (texture.changed === true) {

			this.state.bindTexture(webglTexture);

			gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);

			gl.texParameteri(target, gl.TEXTURE_WRAP_S, texture.wrapS);
			gl.texParameteri(target, gl.TEXTURE_WRAP_T, texture.wrapT);
			gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, texture.magFilter);
			gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, texture.minFilter);

			const level = 0;					// 贴图级别
			const xoffset = 0;					// x 偏移
			const yoffset = 0;					// y 偏移
			const format = gl.RGBA;				// 纹理格式
			const type = gl.UNSIGNED_BYTE;		// 数据类型

			gl.texSubImage2D(target, level, xoffset, yoffset, format, type, texture.image);

			if (texture.generateMipmap === true) {

				gl.generateMipmap(target);

			}

			texture.changed = false;

		} else {

			this.state.bindTexture(webglTexture);

		}

	}

	private bindGeometry(object: WebGLObject): void {

		const { geometry, program } = object;

		const vao = this.cache.acquireVertexArray(geometry);

		this.state.bindVertexArray(vao);

		const webglAttributes = this.cache.acquireAttributes(program);

		for (const webglAttribute of webglAttributes) {

			const attribute = geometry.getAttribute(webglAttribute.name);

			if (attribute === undefined) {

				webglAttribute.disable(vao);
				continue;

			}

			this.uploadAttributeToGPU(attribute);

			webglAttribute.bind(attribute);

		}

		if (geometry.indices !== undefined) {

			this.uploadAttributeToGPU(geometry.indices, this.gl.ELEMENT_ARRAY_BUFFER);

		}

	}

	private uploadAttributeToGPU(attribute: Attribute, target: number = this.gl.ARRAY_BUFFER): void {

		let buffer = this.cache.getBuffer(attribute);

		if (buffer === undefined) {

			buffer = this.cache.acquireBuffer(attribute);

			this.state.bindBuffer(target, buffer);
			this.gl.bufferData(target, attribute.array, attribute.usage);

			attribute.changed = false;

		}

		if (attribute.changed === true) {

			this.state.bindBuffer(target, buffer);
			this.gl.bufferSubData(target, 0, attribute.array);

			attribute.changed = false;

		}

	}

	private renderBuffer(object: WebGLObject): void {

		const { geometry, group } = object;

		let start = 0, count = -1;

		if (group !== undefined) {

			start = group.start;
			count = group.count;

		}

		if (geometry.indices !== undefined) {

			const indices = geometry.indices;

			if (count === -1) {

				count = indices.count;

			}

			const buffer = this.cache.acquireBuffer(indices);
			this.state.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);

			const type = indices.type;

			this.gl.drawElements(

				this.gl.TRIANGLES,
				count,
				type,
				start * indices.array.BYTES_PER_ELEMENT,

			);

		} else if (geometry.position !== undefined) {



		}

	}

}

import { Util } from "../bases/Util";
import { Texture } from "../objects/modules/Texture";
import { Matrix3 } from "../struct/Matrix3";
import { Matrix4 } from "../struct/Matrix4";
import { Vector2 } from "../struct/Vector2";
import { Vector3 } from "../struct/Vector3";
import { Vector4 } from "../struct/Vector4";
import { WebGL } from "./WebGL";

export abstract class WebGLUniform<T = any> {

	public gl: WebGL2RenderingContext;
	public location: WebGLUniformLocation;
	public info: WebGLActiveInfo;

	public current: T;

	public constructor(public name: string) { }

	public set(value: T): void { }

}

abstract class ArrayUniform<T = number[]> extends WebGLUniform<T>{

	public size = 0;

	public override set(value: T): void {

		if (!Array.isArray(value) || value.length < this.size) {

			return;

		}

		this.current = value;

		this.safeSet();

	}

	protected safeSet(): void { }

}

class FNumberUniform extends WebGLUniform<number>{

	public override set(value: number): void {

		if (typeof value !== 'number' || value === this.current) {

			return;

		}

		this.current = value;

		this.safeSet();

	}

	protected safeSet(): void {

		this.gl.uniform1f(this.location, this.current);

	}

}

class INumberUniform extends FNumberUniform {

	protected override safeSet(): void {

		this.gl.uniform1i(this.location, this.current);

	}

}

class FVector2Uniform extends WebGLUniform<Vector2> {

	public override current = new Vector2(NaN, NaN);

	public override set(value: Vector2): void {

		if (!(value instanceof Vector2) || this.current.equals(value)) {

			return;

		}

		this.current.copy(value);

		this.safeSet();

	}

	protected safeSet(): void {

		// this.gl.uniform2fv(this.location, array);

		this.gl.uniform2f(this.location, this.current.x, this.current.y);

	}

}

class IVector2Uniform extends FVector2Uniform {

	protected override safeSet(): void {

		// this.gl.uniform2iv(this.location, array);

		this.gl.uniform2i(this.location, this.current.x, this.current.y);

	}

}

class FVector3Uniform extends WebGLUniform<Vector3> {

	public override current = new Vector3(NaN, NaN, NaN);

	public override set(value: Vector3): void {

		if (!(value instanceof Vector3) || this.current.equals(value)) {

			return;

		}

		this.current.copy(value);

		this.safeSet();

	}

	protected safeSet(): void {

		// this.gl.uniform3fv(this.location, array);

		this.gl.uniform3f(this.location, this.current.x, this.current.y, this.current.z);

	}

}

class IVector3Uniform extends FVector3Uniform {

	protected override safeSet(): void {

		// this.gl.uniform3iv(this.location, array);

		this.gl.uniform3i(this.location, this.current.x, this.current.y, this.current.z);

	}

}

class FVector4Uniform extends WebGLUniform<Vector4> {

	public override current = new Vector4(NaN, NaN, NaN, NaN);

	public override set(value: Vector4): void {

		if (!(value instanceof Vector4) || this.current.equals(value)) {

			return;

		}

		this.current.copy(value);

		this.safeSet();

	}

	protected safeSet(): void {

		// this.gl.uniform4fv(this.location, array);

		this.gl.uniform4f(this.location, this.current.x, this.current.y, this.current.z, this.current.w);

	}

}

class IVector4Uniform extends FVector4Uniform {

	protected override safeSet(): void {

		// this.gl.uniform4iv(this.location, array);

		this.gl.uniform4i(this.location, this.current.x, this.current.y, this.current.z, this.current.w);

	}

}

class Matrix3Uniform extends WebGLUniform<Matrix3> {

	public override current = new Matrix3([]);

	public override set(value: Matrix3): void {

		if (!(value instanceof Matrix3) || this.current.equals(value)) {

			return;

		}

		this.current.copy(value);

		this.gl.uniformMatrix3fv(this.location, false, this.current.elements);

	}

}

class Matrix4Uniform extends WebGLUniform<Matrix4> {

	public override current = new Matrix4([]);

	public override set(value: Matrix4): void {

		if (!(value instanceof Matrix4) || this.current.equals(value)) {

			return;

		}

		this.current.copy(value);

		this.gl.uniformMatrix4fv(this.location, false, this.current.elements);

	}

}

class StructUniform extends WebGLUniform<object> {

	public uniforms: WebGLUniform[] = [];

	public override set(valueObject: object): void {

		this.current = valueObject;

		for (const uniform of this.uniforms) {

			if (uniform.name in valueObject) {

				uniform.set(valueObject[uniform.name]);

			}

		}

	}

}

class FArrayUniform extends ArrayUniform {

	protected override safeSet(): void {

		this.gl.uniform1fv(this.location, this.current);

	}

}

class IArrayUniform extends ArrayUniform {

	protected override safeSet(): void {

		this.gl.uniform1iv(this.location, this.current);

	}

}

class StructArrayUniform extends ArrayUniform<object[]> {

	public uniforms: StructUniform[] = [];

	public override safeSet(): void {

		for (let ii = 0, li = this.uniforms.length; ii < li; ii++) {

			this.uniforms[ii].set(this.current[ii]);

		}

	}

}

export class WebGLUniformFactory {

	public static toUniforms(

		gl: WebGL2RenderingContext,
		info: WebGLActiveInfo,
		location: WebGLUniformLocation,
		uniforms: WebGLUniform[]

	): void {

		const uniform = WebGLUniformFactory.getUniform(info.name, info, uniforms);
		uniform.gl = gl;
		uniform.info = info;
		uniform.location = location;

	}

	private static getUniform(name: string, info: WebGLActiveInfo, uniforms: WebGLUniform[]): WebGLUniform {

		const dotIndex = name.indexOf('.');
		const braIndex = name.indexOf('[');

		if (

			dotIndex !== -1 &&
			braIndex !== -1 &&
			braIndex < dotIndex

		) {

			return WebGLUniformFactory.getArrayStruct(name, info, uniforms);

		} else if (dotIndex !== -1) {

			return WebGLUniformFactory.getStruct(name, info, uniforms);

		} else if (braIndex !== -1) {

			return WebGLUniformFactory.getArray(name, info, uniforms);

		} else {

			return WebGLUniformFactory.getSingle(name, info, uniforms);

		}

	}

	private static getSingle(name: string, info: WebGLActiveInfo, uniforms: WebGLUniform[]): WebGLUniform {

		let uniform: WebGLUniform;

		switch (info.type) {

			case Util.FLOAT:

				uniform = new FNumberUniform(name);

				break;

			case Util.INT:
			case Util.BOOL:

				uniform = new INumberUniform(name);

				break;

			case Util.FLOAT_VEC2:

				uniform = new FVector2Uniform(name);

				break;

			case Util.INT_VEC2:
			case Util.BOOL_VEC2:

				uniform = new IVector2Uniform(name);

				break;

			case Util.FLOAT_VEC3:

				uniform = new FVector3Uniform(name);

				break;

			case Util.INT_VEC3:
			case Util.BOOL_VEC3:

				uniform = new IVector3Uniform(name);

				break;

			case Util.FLOAT_VEC4:

				uniform = new FVector4Uniform(name);

				break;

			case Util.INT_VEC4:
			case Util.BOOL_VEC4:

				uniform = new IVector4Uniform(name);

				break;

			case Util.FLOAT_MAT3:

				uniform = new Matrix3Uniform(name);

				break;

			case Util.FLOAT_MAT4:

				uniform = new Matrix4Uniform(name);

				break;

			case Util.SAMPLER_2D:

				uniform = new INumberUniform(name);

				break;

			default:

				throw new Error(`DXY.singleFactory : 不支持 ${info.type} 类型的 uniform .`);

		}

		uniforms.push(uniform);

		return uniform;

	}

	private static getArray(name: string, info: WebGLActiveInfo, uniforms: WebGLUniform[]): WebGLUniform {

		const LSBI = name.indexOf('['); // left square bracket index = LSBI = 左 中括弧 的索引值
		name = name.substring(0, LSBI);

		let uniform: ArrayUniform;

		switch (info.type) {

			case Util.FLOAT:

				uniform = new FArrayUniform(name);

				break;

			case Util.INT:
			case Util.BOOL:

				uniform = new IArrayUniform(name);

				break;

			default:

				throw new Error(`DXY.arrayFactory : 不支持 ${info.type} 类型的 uniform .`);

		}

		uniform.size = info.size;
		uniforms.push(uniform);

		return uniform;

	}

	private static getStruct(name: string, info: WebGLActiveInfo, uniforms: WebGLUniform[]): WebGLUniform {

		const dotIndex = name.indexOf('.');
		const firstName = name.substring(0, dotIndex);

		let struct = uniforms.find(e => e.name === firstName) as StructUniform;

		if (struct === undefined) {

			struct = new StructUniform(firstName);
			uniforms.push(struct);

		}

		name = name.substring(dotIndex + 1);

		return WebGLUniformFactory.getUniform(name, info, struct.uniforms);

	}

	private static getArrayStruct(name: string, info: WebGLActiveInfo, uniforms: WebGLUniform[]): WebGLUniform {

		const LSBI = name.indexOf('['); // left square bracket index = LSBI = 左 中括弧 的索引值
		const firstName = name.substring(0, LSBI);

		let structArray = uniforms.find(e => e.name === firstName) as StructArrayUniform;

		if (structArray === undefined) {

			structArray = new StructArrayUniform(firstName);
			uniforms.push(structArray);

		}

		const RSBI = name.indexOf(']'); // right square bracket index = RSBI = 右 中括弧 的索引值
		const indexStr = name.substring(LSBI + 1, RSBI);
		const index = Number(indexStr);

		structArray.size = index + 1;

		let struct = structArray.uniforms[index]

		if (struct === undefined) {

			struct = new StructUniform(indexStr);
			structArray.uniforms[index] = struct;

		}

		name = name.substring(RSBI + 2);

		return WebGLUniformFactory.getUniform(name, info, struct.uniforms);

	}

}

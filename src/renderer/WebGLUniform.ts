import { Color } from "../structs/Color";
import { Matrix3 } from "../structs/Matrix3";
import { Matrix4 } from "../structs/Matrix4";
import { Vector2 } from "../structs/Vector2";
import { Vector3 } from "../structs/Vector3";
import { Vector4 } from "../structs/Vector4";

class Helper {

    public static toUniforms(

        gl: WebGL2RenderingContext,
        info: WebGLActiveInfo,
        location: WebGLUniformLocation,
        uniforms: WebGLUniform[]

    ): void {

        Helper.createUniform(gl, info, location, info.name, uniforms);

    }

    private static createUniform(

        gl: WebGL2RenderingContext,
        info: WebGLActiveInfo,
        location: WebGLUniformLocation,
        path: string,
        uniforms: WebGLUniform[],

    ): void {

        const dotIndex = path.indexOf('.');
        const braIndex = path.indexOf('[');

        if (

            dotIndex !== -1 &&
            braIndex !== -1 &&
            braIndex < dotIndex

        ) {

            Helper.createArrayStruct(gl, info, location, path, uniforms);

        } else if (dotIndex !== -1) {

            Helper.createStruct(gl, info, location, path, uniforms);

        } else if (braIndex !== -1) {

            Helper.createArray(gl, info, location, path, uniforms);

        } else {

            Helper.createSingle(gl, info, location, path, uniforms);

        }

    }

    private static createSingle(

        gl: WebGL2RenderingContext,
        info: WebGLActiveInfo,
        location: WebGLUniformLocation,
        name: string,
        uniforms: WebGLUniform[]

    ): void {

        let uniform: WebGLUniform;

        switch (info.type) {

            case gl.FLOAT:

                uniform = new FNumberUniform(gl, info, location, name);
                break;

            case gl.INT:
            case gl.BOOL:

                uniform = new INumberUniform(gl, info, location, name);
                break;

            case gl.FLOAT_VEC2:

                uniform = new FVector2Uniform(gl, info, location, name);
                break;

            case gl.INT_VEC2:
            case gl.BOOL_VEC2:

                uniform = new IVector2Uniform(gl, info, location, name);
                break;

            case gl.FLOAT_VEC3:

                uniform = new FVector3Uniform(gl, info, location, name);
                break;

            case gl.INT_VEC3:
            case gl.BOOL_VEC3:

                uniform = new IVector3Uniform(gl, info, location, name);
                break;

            case gl.FLOAT_VEC4:

                uniform = new FVector4Uniform(gl, info, location, name);
                break;

            case gl.INT_VEC4:
            case gl.BOOL_VEC4:

                uniform = new IVector4Uniform(gl, info, location, name);
                break;

            case gl.FLOAT_MAT3:

                uniform = new Matrix3Uniform(gl, info, location, name);
                break;

            case gl.FLOAT_MAT4:

                uniform = new Matrix4Uniform(gl, info, location, name);
                break;

            case gl.SAMPLER_2D:
            case gl.SAMPLER_CUBE:

                uniform = new TextureUniform(gl, info, location, name);
                break;

            default:

                throw new Error(`DXY.WebGLUniform : 不支持 ${info.type} 类型的 uniform . `);

        }

        uniforms.push(uniform);

    }

    private static createArray(

        gl: WebGL2RenderingContext,
        info: WebGLActiveInfo,
        location: WebGLUniformLocation,
        path: string,
        uniforms: WebGLUniform[]

    ): void {

        const LSBI = path.indexOf('['); // left square bracket index = LSBI = 左 中括弧 的索引值
        path = path.substring(0, LSBI);

        let uniform: ArrayUniform;

        switch (info.type) {

            case gl.FLOAT:

                uniform = new FArrayUniform(gl, info, location, path);

                break;

            case gl.INT:
            case gl.BOOL:

                uniform = new IArrayUniform(gl, info, location, path);

                break;

            default:

                throw new Error(`DXY.WebGLUniform : 不支持 ${info.type} 类型的 uniform . `);

        }

        uniform.size = info.size;
        uniforms.push(uniform);

    }

    private static createStruct(

        gl: WebGL2RenderingContext,
        info: WebGLActiveInfo,
        location: WebGLUniformLocation,
        name: string,
        uniforms: WebGLUniform[]

    ): void {

        const dotIndex = name.indexOf('.');
        const firstName = name.substring(0, dotIndex);

        let struct = uniforms.find(e => e.name === firstName) as StructUniform;

        if (!struct) {

            struct = new StructUniform(gl, info, location, firstName);
            uniforms.push(struct);

        }

        name = name.substring(dotIndex + 1);
        Helper.createUniform(gl, info, location, name, struct.uniforms);

    }

    private static createArrayStruct(

        gl: WebGL2RenderingContext,
        info: WebGLActiveInfo,
        location: WebGLUniformLocation,
        path: string,
        uniforms: WebGLUniform[]

    ): void {

        const LSBI = path.indexOf('['); // left square bracket index = LSBI = 左 中括弧 的索引值
        const firstName = path.substring(0, LSBI);

        let structArray = uniforms.find(e => e.name === firstName) as StructArrayUniform;

        if (!structArray) {

            structArray = new StructArrayUniform(gl, info, location, firstName);
            uniforms.push(structArray);

        }

        const RSBI = path.indexOf(']'); // right square bracket index = RSBI = 右 中括弧 的索引值
        const indexStr = path.substring(LSBI + 1, RSBI);
        const index = Number(indexStr);

        structArray.size = index + 1;

        let struct = structArray.uniforms[index]

        if (!struct) {

            struct = new StructUniform(gl, info, location, indexStr);
            structArray.uniforms[index] = struct;

        }

        path = path.substring(RSBI + 2);
        Helper.createSingle(gl, info, location, path, struct.uniforms);

    }

}

export abstract class WebGLUniform<T = any> {

    public constructor(

        public readonly gl: WebGL2RenderingContext,
        public readonly info: WebGLActiveInfo,
        public readonly location: WebGLUniformLocation,
        public readonly name: string,
        public current: T

    ) { }

    public set(value: T): void { }

    public static toUniforms(

        gl: WebGL2RenderingContext,
        info: WebGLActiveInfo,
        location: WebGLUniformLocation,
        uniforms: WebGLUniform[] = [],

    ): WebGLUniform[] {

        Helper.toUniforms(gl, info, location, uniforms);
        return uniforms;

    }

}

//#region array

abstract class ArrayUniform<T = number[]> extends WebGLUniform<T>{

    public size = 0;

    public constructor(

        gl: WebGL2RenderingContext,
        info: WebGLActiveInfo,
        location: WebGLUniformLocation,
        name: string,

    ) {

        super(gl, info, location, name, [] as T);

    }

    public override set(value: T): void {

        if (Array.isArray(value) && value.length >= this.size) {

            this.current = value;
            this.safeSet();

        }

    }

    protected safeSet(): void { }

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

//#endregion

//#region single

class FNumberUniform extends WebGLUniform<number>{

    public constructor(

        gl: WebGL2RenderingContext,
        info: WebGLActiveInfo,
        location: WebGLUniformLocation,
        name: string,

    ) {

        super(gl, info, location, name, NaN);

    }

    public override set(value: number): void {

        if (typeof value !== 'number') {

            value = Number(value);

        }

        if (value !== this.current) {

            this.current = value;
            this.safeSet();

        }

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

export class TextureUniform extends INumberUniform { }

class StructUniform extends WebGLUniform<object> {

    public uniforms: WebGLUniform[] = [];

    public constructor(

        gl: WebGL2RenderingContext,
        info: WebGLActiveInfo,
        location: WebGLUniformLocation,
        name: string,

    ) {

        super(gl, info, location, name, {});

    }

    public override set(valueObject: any): void {

        this.current = valueObject;

        for (const uniform of this.uniforms) {

            if (uniform.name in valueObject) {

                uniform.set(valueObject[uniform.name]);

            }

        }

    }

}

//#endregion

//#region Vector2

class FVector2Uniform extends WebGLUniform<Vector2> {

    public constructor(

        gl: WebGL2RenderingContext,
        info: WebGLActiveInfo,
        location: WebGLUniformLocation,
        name: string,

    ) {

        super(gl, info, location, name, new Vector2(NaN, NaN));

    }

    public override set(value: Vector2): void {

        if (value instanceof Vector2 && !this.current.equals(value)) {

            this.current.copy(value);
            this.safeSet();

        }

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

//#endregion

//#region Vector3

class FVector3Uniform extends WebGLUniform<Vector3> {

    public constructor(

        gl: WebGL2RenderingContext,
        info: WebGLActiveInfo,
        location: WebGLUniformLocation,
        name: string,

    ) {

        super(gl, info, location, name, new Vector3(NaN, NaN, NaN));

    }

    public override set(value: Vector3 | Color): void {

        if (value instanceof Vector3 && !this.current.equals(value)) {

            this.current.copy(value);
            this.safeSet();

        }

        if (

            value instanceof Color &&

            (
                value.r !== this.current.x ||
                value.g !== this.current.y ||
                value.b !== this.current.z
            )

        ) {

            value.toVector3(this.current);
            this.safeSet();

        }

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

//#endregion

//#region Vector4

class FVector4Uniform extends WebGLUniform<Vector4> {

    public constructor(

        gl: WebGL2RenderingContext,
        info: WebGLActiveInfo,
        location: WebGLUniformLocation,
        name: string,

    ) {

        super(gl, info, location, name, new Vector4(NaN, NaN, NaN, NaN));

    }

    public override set(value: Vector4): void {

        if (value instanceof Vector4 && !this.current.equals(value)) {

            this.current.copy(value);
            this.safeSet();

        }

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

//#endregion

//#region matrix

class Matrix3Uniform extends WebGLUniform<Matrix3> {

    public constructor(

        gl: WebGL2RenderingContext,
        info: WebGLActiveInfo,
        location: WebGLUniformLocation,
        name: string,

    ) {

        super(gl, info, location, name, new Matrix3([]));

    }

    public override set(value: Matrix3): void {

        if (value instanceof Matrix3 && !this.current.equals(value)) {

            this.current.copy(value);
            this.gl.uniformMatrix3fv(this.location, false, this.current.elements);

        }

    }

}

class Matrix4Uniform extends WebGLUniform<Matrix4> {

    public constructor(

        gl: WebGL2RenderingContext,
        info: WebGLActiveInfo,
        location: WebGLUniformLocation,
        name: string,

    ) {

        super(gl, info, location, name, new Matrix4([]));

    }

    public override set(value: Matrix4): void {

        if (value instanceof Matrix4 && !this.current.equals(value)) {

            this.current.copy(value);
            this.gl.uniformMatrix4fv(this.location, false, this.current.elements);

        }

    }

}

//#endregion

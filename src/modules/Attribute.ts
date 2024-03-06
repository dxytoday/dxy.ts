import { WebGLConstants } from "../renderer/WebGLConstants";
import { Vector3 } from "../structs/Vector3";
import { EventObject } from "./EventObject";

export type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Uint32Array | Float32Array;

class Helper {

    public static getGLType(constructor: Function): number {

        if (constructor === Int8Array) {

            return WebGLConstants.BYTE;

        }

        if (constructor === Uint8Array) {

            return WebGLConstants.UNSIGNED_BYTE;

        }

        if (constructor === Int16Array) {

            return WebGLConstants.SHORT;

        }

        if (constructor === Uint16Array) {

            return WebGLConstants.UNSIGNED_SHORT;

        }

        if (constructor === Uint32Array) {

            return WebGLConstants.UNSIGNED_INT;

        }

        if (constructor === Float32Array) {

            return WebGLConstants.FLOAT;

        }

        return WebGLConstants.FLOAT;

    }

}

export class Attribute extends EventObject {

    public readonly dataType: number;
    public dataUsage = WebGLConstants.STATIC_DRAW;

    public needsUpdate = false;

    public constructor(

        public array: TypedArray,
        public itemSize: number,
        public normalized = false,

    ) {

        super();

        this.dataType = Helper.getGLType(array.constructor);

    }

    public get count(): number {

        return this.array.length / this.itemSize;

    }

    public getX(index: number): number {

        return this.array[index * this.itemSize];

    }

    public getY(index: number): number {

        return this.array[index * this.itemSize + 1];

    }

    public getZ(index: number): number {

        return this.array[index * this.itemSize + 2];

    }

    public toVector3(index: number, v: Vector3): Vector3 {

        v.x = this.getX(index);
        v.y = this.getY(index);
        v.z = this.getZ(index);

        return v;

    }

}
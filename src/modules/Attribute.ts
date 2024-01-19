import { WebGLConstants } from "../renderer/WebGLConstants";
import { EventObject } from "./EventObject";

export type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Uint32Array | Float32Array;

class AttributeHelper {

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

        this.dataType = AttributeHelper.getGLType(array.constructor);

    }

    public get count(): number {

        return this.array.length / this.itemSize;

    }

    public getX(index: number): number {

        return this.array[index * this.itemSize];

    }

}
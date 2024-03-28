import { Vector3 } from "../math/Vector3";
import { Constants } from "../Constants";
import { Box3 } from "../math/Box3";

abstract class Helper {

    public static readonly vector3 = new Vector3();

    public static getGLType(constructor: Function): number {

        if (constructor === Int8Array) {

            return Constants.BYTE;

        }

        if (constructor === Uint8Array) {

            return Constants.UNSIGNED_BYTE;

        }

        if (constructor === Int16Array) {

            return Constants.SHORT;

        }

        if (constructor === Uint16Array) {

            return Constants.UNSIGNED_SHORT;

        }

        if (constructor === Uint32Array) {

            return Constants.UNSIGNED_INT;

        }

        if (constructor === Float32Array) {

            return Constants.FLOAT;

        }

        return Constants.FLOAT;

    }

}

export class Attribute {

    public readonly dataType: number;

    public needsUpdate = false;

    public constructor(

        public array: TypedArray,
        public itemSize: number,
        public normalized = false,

    ) {

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

    public toVector3(index: number, target: Vector3): Vector3 {

        target.x = this.getX(index);
        target.y = this.getY(index);
        target.z = this.getZ(index);

        return target;

    }

    public toBox3(target: Box3): Box3 {

        target.makeEmpty();

        for (let ii = 0, li = this.count; ii < li; ii++) {

            this.toVector3(ii, Helper.vector3);
            target.expandByPoint(Helper.vector3);

        }

        return target;

    }

    public static createF3(array: TypedArray | number[]): Attribute {

        return new Attribute(new Float32Array(array), 3, false);

    }

    public static createF2(array: TypedArray | number[]): Attribute {

        return new Attribute(new Float32Array(array), 2, false);

    }

}

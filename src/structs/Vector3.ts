import { Matrix3 } from "./Matrix3";

export class Vector3 {

    public constructor(

        public x = 0,
        public y = 0,
        public z = 0,

    ) { }

    public set(vector3: Vector3): Vector3;
    public set(array: number[], offset?: number): Vector3;
    public set(x: number, y: number, z: number): Vector3;
    public set(): Vector3 {

        const arg0 = arguments[0];

        if (arg0 instanceof Vector3) {

            this.x = arg0.x;
            this.y = arg0.y;
            this.z = arg0.z;

        } else if (Array.isArray(arg0)) {

            const offset = arguments[1] || 0;

            this.x = arg0[offset];
            this.y = arg0[offset + 1];
            this.z = arg0[offset + 2];


        } else if (arguments.length >= 3) {

            this.x = arg0;
            this.y = arguments[1];
            this.z = arguments[2];

        }

        return this;

    }

    public sub(right: Vector3): Vector3 {

        if (right instanceof Vector3) {

            this.x -= right.x;
            this.y -= right.y;
            this.z -= right.z;

        }

        return this;

    }

    public multiply(matrix3: Matrix3): Vector3;
    public multiply(scalar: number): Vector3;
    public multiply(): Vector3 {

        const right = arguments[0];

        if (typeof right === 'number') {

            this.x *= right;
            this.y *= right;
            this.z *= right;

        } else if (right instanceof Matrix3) {

            const x = this.x;
            const y = this.y;
            const z = this.z;
            const e = right.elements;

            this.x = e[0] * x + e[3] * y + e[6] * z;
            this.y = e[1] * x + e[4] * y + e[7] * z;
            this.z = e[2] * x + e[5] * y + e[8] * z;

        }

        return this;

    }

    public equals(v: Vector3): boolean {

        return (

            v.x === this.x &&
            v.y === this.y &&
            v.z === this.z

        );

    }

}
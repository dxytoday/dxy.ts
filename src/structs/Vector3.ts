import { Matrix3 } from "./Matrix3";
import { Matrix4 } from "./Matrix4";

export class Vector3 {

    public constructor(

        public x = 0,
        public y = 0,
        public z = 0,

    ) { }

    public set(x: number, y: number, z: number): Vector3 {

        this.x = x;
        this.y = y;
        this.z = z;

        return this;

    }

    public copy(v: Vector3): Vector3 {

        this.x = v.x;
        this.y = v.y;
        this.z = v.z;

        return this;

    }

    public setScalar(scalar: number): Vector3 {

        this.x = scalar;
        this.y = scalar;
        this.z = scalar;

        return this;

    }

    public setFromArray(array: number[], offset = 0): Vector3 {

        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];

        return this;

    }

    public add(right: Vector3): Vector3 {

        this.x += right.x;
        this.y += right.y;
        this.z += right.z;

        return this;

    }

    public sub(v: Vector3): Vector3 {

        return this.subVectors(this, v);

    }

    public subVectors(l: Vector3, r: Vector3): Vector3 {

        this.x = l.x - r.x;
        this.y = l.y - r.y;
        this.z = l.z - r.z;

        return this;

    }

    public multiplyScalar(scalar: number): Vector3 {

        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;

        return this;

    }

    public applyMatrix3(m: Matrix3): Vector3 {

        const x = this.x;
        const y = this.y;
        const z = this.z;

        const me = m.elements;

        this.x = x * me[0] + y * me[3] + z * me[6];
        this.y = x * me[1] + y * me[4] + z * me[7];
        this.z = x * me[2] + y * me[5] + z * me[8];

        return this;

    }

    public applyMatrix4(m: Matrix4): Vector3 {

        const x = this.x;
        const y = this.y;
        const z = this.z;
        const e = m.elements;

        const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

        this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
        this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
        this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

        return this;

    }

    public equals(v: Vector3): boolean {

        return v.x === this.x && v.y === this.y && v.z === this.z;

    }

    public equalsScalar(scalar: number): boolean {

        return scalar === this.x && scalar === this.y && scalar === this.z;

    }

    public crossVectors(l: Vector3, r: Vector3): Vector3 {

        this.x = l.y * r.z - l.z * r.y;
        this.y = l.z * r.x - l.x * r.z;
        this.z = l.x * r.y - l.y * r.x;

        return this;
    }

    public lengthSq(): number {

        return this.x * this.x + this.y * this.y + this.z * this.z;

    }

    public length(): number {

        return Math.sqrt(this.lengthSq());

    }

    public normalize(): Vector3 {

        return this.multiplyScalar(1 / (this.length() || 1));

    }

    public distanceTo(v: Vector3): number {

        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;

        return Math.sqrt(dx * dx + dy * dy + dz * dz);

    }

}
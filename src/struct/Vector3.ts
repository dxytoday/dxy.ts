import { Matrix4 } from "./Matrix4";
import { Spherical } from "./Spherical";

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

	public setFromSpherical(s: Spherical): Vector3 {

		const sinPhiRadius = Math.sin(s.phi) * s.radius;

		this.x = sinPhiRadius * Math.sin(s.theta);
		this.y = Math.cos(s.phi) * s.radius;
		this.z = sinPhiRadius * Math.cos(s.theta);

		return this;

	}

	public add(v: Vector3): Vector3 {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	}

	public sub(v: Vector3): Vector3 {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	}

	public multiplyScalar(scalar: number): Vector3 {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;

	}

	public divideScalar(scalar: number): Vector3 {

		return this.multiplyScalar(1 / scalar);

	}

	public subVectors(a: Vector3, b: Vector3): Vector3 {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	}

	public setScalar(scalar: number): Vector3 {

		this.x = scalar;
		this.y = scalar;
		this.z = scalar;

		return this;

	}

	public lengthSq(): number {

		return (

			this.x * this.x +
			this.y * this.y +
			this.z * this.z

		);

	}

	public length(): number {

		return Math.sqrt(this.lengthSq());

	}

	public crossVectors(a: Vector3, b: Vector3): Vector3 {

		const ax = a.x;
		const ay = a.y;
		const az = a.z;

		const bx = b.x;
		const by = b.y;
		const bz = b.z;

		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;

		return this;
	}

	public normalize(): Vector3 {

		return this.divideScalar(this.length() || 1);

	}

	public equals(v: Vector3): boolean {

		return (

			v.x === this.x &&
			v.y === this.y &&
			v.z === this.z

		);

	}

	public copy(v: Vector3): Vector3 {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	}

	public toArray(array: number[] = [], offset = 0): number[] {

		array[offset + 0] = this.x;
		array[offset + 1] = this.y;
		array[offset + 2] = this.z;

		return array;

	}

	public fromArray(array: number[], offset = 0): Vector3 {

		this.x = array[offset];
		this.y = array[offset + 1];
		this.z = array[offset + 2];

		return this;
	}

	public distanceToSquared(v: Vector3): number {

		const dx = this.x - v.x;
		const dy = this.y - v.y;
		const dz = this.z - v.z;

		return dx * dx + dy * dy + dz * dz;
	}

	public distanceTo(v: Vector3): number {

		return Math.sqrt(this.distanceToSquared(v));

	}

	public setFromMatrixColumn(m: Matrix4, index: number): Vector3 {

		return this.fromArray(m.elements, index * 4);

	}

	public clone(): Vector3 {

		return new Vector3(this.x, this.y, this.z);

	}

	public toJSON(): object {

		return { x: this.x, y: this.y, z: this.z };

	}

	public isZero(): boolean {

		return this.x === 0 && this.y === 0 && this.z === 0;

	}

	public transformDirection(m: Matrix4): Vector3 {

		const x = this.x;
		const y = this.y;
		const z = this.z;
		const e = m.elements;

		this.x = e[0] * x + e[4] * y + e[8] * z;
		this.y = e[1] * x + e[5] * y + e[9] * z;
		this.z = e[2] * x + e[6] * y + e[10] * z;

		return this.normalize();

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

}

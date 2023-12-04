export class Vector4 {

	public constructor(

		public x = 0,
		public y = 0,
		public z = 0,
		public w = 1,

	) { }

	public set(x: number, y: number, z: number, w: number): Vector4 {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;
	}

	public equals(v: Vector4): boolean {

		return (

			v.x === this.x &&
			v.y === this.y &&
			v.z === this.z &&
			v.w === this.w

		);

	}

	public copy(v: Vector4): Vector4 {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		this.w = v.w;

		return this;

	}

	public toArray(array: number[] = [], offset = 0): number[] {

		array[offset + 0] = this.x;
		array[offset + 1] = this.y;
		array[offset + 2] = this.z;
		array[offset + 3] = this.w;

		return array;

	}

	public fromArray(array: number[], offset = 0): Vector4 {

		this.x = array[offset];
		this.y = array[offset + 1];
		this.z = array[offset + 2];
		this.w = array[offset + 3];

		return this;
	}

}

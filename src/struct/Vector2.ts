export class Vector2 {

	public constructor(

		public x = 0,
		public y = 0,

	) { }

	public set(x: number, y: number): Vector2 {

		this.x = x;
		this.y = y;

		return this;
	}

	public sub(v: Vector2): Vector2 {

		this.x -= v.x;
		this.y -= v.y;

		return this;

	}

	public equals(v: Vector2): boolean {

		return (

			v.x === this.x &&
			v.y === this.y

		);

	}

	public copy(v: Vector2): Vector2 {

		this.x = v.x;
		this.y = v.y;

		return this;

	}

	public toArray(array: number[] = [], offset = 0): number[] {

		array[offset + 0] = this.x;
		array[offset + 1] = this.y;

		return array;

	}

	public subVectors(a: Vector2, b: Vector2): Vector2 {

		this.x = a.x - b.x;
		this.y = a.y - b.y;

		return this;

	}

	public isZero(): boolean {

		return this.x === 0 && this.y === 0;

	}

}
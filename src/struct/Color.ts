import { Vector3 } from "./Vector3";

export class Color extends Vector3 {

	public constructor(r = 1, g = 1, b = 1) {

		super(r, g, b);

	}

	public get r() {

		return this.x;
	}

	public set r(r: number) {

		this.x = r;

	}

	public get g() {

		return this.y;
	}

	public set g(g: number) {

		this.y = g;

	}

	public get b() {

		return this.z;
	}

	public set b(b: number) {

		this.z = b;

	}

	public override clone(): Color {

		return new Color(this.x, this.y, this.z);

	}

}

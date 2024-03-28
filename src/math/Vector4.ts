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

    public copy(v: Vector4): Vector4 {

        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        this.w = v.w;

        return this;

    }

    public equals(v: Vector4): boolean {

        return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;

    }

    public equalsComponent(x: number, y: number, z: number, w: number): boolean {

        return x === this.x && y === this.y && z === this.z && w === this.w;

    }

    public clone(): Vector4 {

        return new Vector4().copy(this);

    }

    public dot(v: Vector4): number {

        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;

    }

}
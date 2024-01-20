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

    public copy(v: Vector2): Vector2 {

        this.y = v.y;
        this.x = v.x;

        return this;

    }

    public setScalar(scalar: number): Vector2 {

        this.x = scalar;
        this.y = scalar;

        return this;

    }

    public add(v: Vector2): Vector2 {

        this.x += v.x;
        this.y += v.y;

        return this;

    }

    public sub(v: Vector2): Vector2 {

        return this.subVectors(this, v);

    }

    public subVectors(l: Vector2, r: Vector2): Vector2 {

        this.x = l.x - r.x;
        this.y = l.y - r.y;

        return this;

    }

    public multiplyScalar(scalar: number): Vector2 {

        this.x *= scalar;
        this.y *= scalar;

        return this;

    }

    public equals(v: Vector2): boolean {

        return v.x === this.x && v.y === this.y;

    }

    public equalsScalar(scalar: number): boolean {

        return scalar === this.x && scalar === this.y;

    }

}
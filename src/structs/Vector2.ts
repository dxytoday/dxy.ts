export class Vector2 {

    public constructor(

        public x = 0,
        public y = 0,

    ) { }

    public set(scalar: number): Vector2;
    public set(vector2: Vector2): Vector2;
    public set(array: number[], offset?: number): Vector2;
    public set(x: number, y: number): Vector2;
    public set(): Vector2 {

        const arg0 = arguments[0];

        if (arg0 instanceof Vector2) {

            this.y = arg0.y;
            this.x = arg0.x;

        } else if (Array.isArray(arg0)) {

            const offset = arguments[1] || 0;

            this.x = arg0[offset];
            this.y = arg0[offset + 1];

        } else if (arguments.length >= 2) {

            this.x = arg0;
            this.y = arguments[1];

        } else if (typeof arg0 === 'number') {

            this.x = arg0;
            this.y = arg0;

        }

        return this;

    }

    public sub(scalar: number): Vector2;
    public sub(x: number, y: number): Vector2;
    public sub(vector2: Vector2): Vector2;
    public sub(v1: Vector2, v2: Vector2): Vector2;
    public sub(): Vector2 {

        const arg0 = arguments[0];
        const arg1 = arguments[1];

        if (typeof arg0 === 'number') {

            if (typeof arg1 === 'number') {

                this.x -= arg0;
                this.y -= arg1;

            } else {

                this.x -= arg0;
                this.y -= arg0;

            }

        } else if (arg0 instanceof Vector2) {

            if (arg1 instanceof Vector2) {

                this.x = arg0.x - arg1.x;
                this.y = arg0.y - arg1.y;

            } else {

                this.x -= arg0.x;
                this.y -= arg0.y;

            }

        }

        return this;

    }

    public multiply(scalar: number): Vector2;
    public multiply(): Vector2 {

        const arg0 = arguments[0];

        if (typeof arg0 === 'number') {

            this.x *= arg0;
            this.y *= arg0;

        }

        return this;

    }

    public equals(v: Vector2): boolean {

        return (

            v.x === this.x &&
            v.y === this.y

        );

    }

}
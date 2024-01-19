export class Vector4 {

    public constructor(

        public x = 0,
        public y = 0,
        public z = 0,
        public w = 1,

    ) { }

    public set(vector4: Vector4): Vector4;
    public set(array: number[], offset?: number): Vector4;
    public set(x: number, y: number, z: number, w: number): Vector4;
    public set(): Vector4 {

        const arg0 = arguments[0];

        if (arg0 instanceof Vector4) {

            this.x = arg0.x;
            this.y = arg0.y;
            this.z = arg0.z;
            this.w = arg0.w;

        } else if (Array.isArray(arg0)) {

            const offset = arguments[1] || 0;

            this.x = arg0[offset];
            this.y = arg0[offset + 1];
            this.z = arg0[offset + 2];
            this.w = arg0[offset + 3];

        } else if (arguments.length >= 4) {

            this.x = arg0;
            this.y = arguments[1];
            this.z = arguments[2];
            this.w = arguments[3];

        }

        return this;

    }

    public equals(vector4: Vector4): boolean;
    public equals(x: number, y: number, z: number, w: number): boolean;
    public equals(): boolean {

        const arg0 = arguments[0];

        if (arg0 instanceof Vector4) {

            return (

                arg0.x === this.x &&
                arg0.y === this.y &&
                arg0.z === this.z &&
                arg0.w === this.w

            );

        } else if (arguments.length >= 4) {

            return (

                arg0 === this.x &&
                arguments[1] === this.y &&
                arguments[2] === this.z &&
                arguments[3] === this.w

            );

        }

        return false;

    }

}
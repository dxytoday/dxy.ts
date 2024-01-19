import { Vector4 } from "./Vector4";

export class Quaternion extends Vector4 {

    public constructor(x?: number, y?: number, z?: number, w?: number) {

        super(x, y, z, w);

    }

    public setEuler(x: number, y: number, z: number): Quaternion {

        /**
         * 
         * 三个四元数按照 xyz 顺序相乘
         *
         * 		qx = ( cos(x), [sin(x), 0, 0] )
         * 		qy = ( cos(y), [0, sin(y), 0] )
         * 		qz = ( cos(z), [0, 0, sin(z)] )
         *
         * 四元数相乘的规则：
         * 
         * 		a = ( aw, av = [ax, ay, az] ) 
         * 		b = ( bw, bv = [bx, by, bz] )
         * 
         * 		a * b = aw * bw - av · bv, aw * bv + bw * av + av X bv
         *
         */

        const c1 = Math.cos(x / 2);
        const c2 = Math.cos(y / 2);
        const c3 = Math.cos(z / 2);

        const s1 = Math.sin(x / 2);
        const s2 = Math.sin(y / 2);
        const s3 = Math.sin(z / 2);

        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;

        return this;

    }

}
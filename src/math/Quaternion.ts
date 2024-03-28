abstract class Helper {

    public static clamp(value: number, min: number, max: number): number {

        return Math.max(min, Math.min(max, value));

    }

}

export class Quaternion {

    private _eulerX = 0;
    private _eulerY = 0;
    private _eulerZ = 0;

    public constructor(

        public x = 0,
        public y = 0,
        public z = 0,
        public w = 1,

    ) {

        this.updateEuler();

    }

    public set eulerX(x: number) {

        this._eulerX = x;
        this.setFromEuler();

    }

    public set eulerY(y: number) {

        this._eulerY = y;
        this.setFromEuler();

    }

    public set eulerZ(z: number) {

        this._eulerZ = z;
        this.setFromEuler();

    }

    public get eulerX(): number {

        return this._eulerX;

    }

    public get eulerY(): number {

        return this._eulerY;

    }

    public get eulerZ(): number {

        return this._eulerZ;

    }

    public setFromArray(array: number[], offset = 0): Quaternion {

        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        this.w = array[offset + 3];

        this.updateEuler();

        return this;

    }

    public setFromEuler(

        x = this._eulerX,
        y = this._eulerY,
        z = this._eulerZ

    ): Quaternion {

        /**
         * 
         *      三个四元数按照 xyz 顺序相乘
         *
         * 		qx = ( cos(x), [sin(x), 0, 0] )
         * 		qy = ( cos(y), [0, sin(y), 0] )
         * 		qz = ( cos(z), [0, 0, sin(z)] )
         *
         *      四元数相乘的规则：
         * 
         * 		a = ( aw, av = [ax, ay, az] ) 
         * 		b = ( bw, bv = [bx, by, bz] )
         * 
         * 		a * b = aw * bw - av · bv, aw * bv + bw * av + av X bv
         *
         */

        this._eulerX = x;
        this._eulerY = y;
        this._eulerZ = z;

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

    public updateEuler(): Quaternion {

        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;

        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;

        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;

        const m11 = (1 - (yy + zz));
        const m12 = (xy - wz);
        const m13 = (xz + wy);
        const m22 = (1 - (xx + zz));
        const m23 = (yz - wx);
        const m32 = (yz + wx);
        const m33 = (1 - (xx + yy));

        this._eulerY = Math.asin(Helper.clamp(m13, -1, 1));

        if (Math.abs(m13) < 0.9999999) {

            this._eulerX = Math.atan2(-m23, m33);
            this._eulerZ = Math.atan2(-m12, m11);

        } else {

            this._eulerX = Math.atan2(m32, m22);
            this._eulerZ = 0;

        }

        return this;

    }

}
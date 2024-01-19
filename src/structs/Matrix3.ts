import { Matrix4 } from "./Matrix4";

export class Matrix3 {

    public constructor(

        public readonly elements = [

            1, 0, 0,
            0, 1, 0,
            0, 0, 1,

        ]

    ) { }


    public set(matrix3: Matrix3): Matrix3;
    public set(
        n11: number, n12: number, n13: number,
        n21: number, n22: number, n23: number,
        n31: number, n32: number, n33: number,
    ): Matrix3;
    public set(): Matrix3 {

        const arg0 = arguments[0];

        if (arg0 instanceof Matrix3) {

            this.elements.length = 0;
            this.elements.push(...arg0.elements);

        } else if (arguments.length >= 9) {

            this.elements[0] = arg0;
            this.elements[1] = arguments[1];
            this.elements[2] = arguments[2];
            this.elements[3] = arguments[3];
            this.elements[4] = arguments[4];
            this.elements[5] = arguments[5];
            this.elements[6] = arguments[6];
            this.elements[7] = arguments[7];
            this.elements[8] = arguments[8];

        }

        return this;

    }

    public invert(): Matrix3 {

        /**
         *
         * 经典伴随矩阵求逆
         *
         * 先计算所有元素的余子式值
         * 然后余子式值组成的矩阵再转置
         * 再除以矩阵的行列式的值
         *
         * 注意：以扩展形式的矩阵行列式求值
         *
         */

        const te = this.elements;

        const n11 = te[0], n12 = te[1], n13 = te[2];
        const n21 = te[3], n22 = te[4], n23 = te[5];
        const n31 = te[6], n32 = te[7], n33 = te[8];

        const t11 = n33 * n22 - n23 * n32;
        const t12 = n23 * n31 - n33 * n21;
        const t13 = n32 * n21 - n22 * n31;

        const det = n11 * t11 + n12 * t12 + n13 * t13;

        if (det === 0) {

            return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);

        }

        const detInv = 1 / det;

        te[0] = t11 * detInv;
        te[1] = (n13 * n32 - n33 * n12) * detInv;
        te[2] = (n23 * n12 - n13 * n22) * detInv;

        te[3] = t12 * detInv;
        te[4] = (n33 * n11 - n13 * n31) * detInv;
        te[5] = (n13 * n21 - n23 * n11) * detInv;

        te[6] = t13 * detInv;
        te[7] = (n12 * n31 - n32 * n11) * detInv;
        te[8] = (n22 * n11 - n12 * n21) * detInv;

        return this;

    }

    public transpose(): Matrix3 {

        /**
         * 
         * 0  1  2        0  3  6
         * 3  4  5   ->   1  4  7
         * 6  7  8        2  5  8
         * 
         */

        let tmp: number;
        const m = this.elements;

        tmp = m[1];
        m[1] = m[3];
        m[3] = tmp;

        tmp = m[2];
        m[2] = m[6];
        m[6] = tmp;

        tmp = m[5];
        m[5] = m[7];
        m[7] = tmp;

        return this;
    }

    public setNormalMatrix(matrix4: Matrix4): Matrix3 {

        matrix4.getLinearMatrix(this);
        return this.invert().transpose();

    }

    public equals(m: Matrix3): boolean {

        const te = this.elements;
        const me = m.elements;

        for (let ii = 0; ii < 9; ii++) {

            if (te[ii] !== me[ii]) {

                return false;

            }

        }

        return true;
    }

}
import { Matrix4 } from "./Matrix4";

export class Matrix3 {

    public constructor(

        public readonly elements = [

            1, 0, 0,
            0, 1, 0,
            0, 0, 1,

        ]

    ) { }

    public set(

        n11: number, n12: number, n13: number,
        n21: number, n22: number, n23: number,
        n31: number, n32: number, n33: number,

    ): Matrix3 {

        this.elements[0] = n11;
        this.elements[1] = n12;
        this.elements[2] = n13;

        this.elements[3] = n21;
        this.elements[4] = n22;
        this.elements[5] = n23;

        this.elements[6] = n31;
        this.elements[7] = n32;
        this.elements[8] = n33;

        return this;

    }

    public copy(m: Matrix3): Matrix3 {

        this.elements.length = 0;
        this.elements.push(...m.elements);

        return this;

    }

    public setFromMatrix4(m: Matrix4): Matrix3 {

        this.elements[0] = m.elements[0];
        this.elements[1] = m.elements[1];
        this.elements[2] = m.elements[2];

        this.elements[3] = m.elements[4];
        this.elements[4] = m.elements[5];
        this.elements[5] = m.elements[6];

        this.elements[6] = m.elements[8];
        this.elements[7] = m.elements[9];
        this.elements[8] = m.elements[10];

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

        this.set(

            this.elements[0], this.elements[3], this.elements[6],
            this.elements[1], this.elements[4], this.elements[7],
            this.elements[2], this.elements[5], this.elements[8],

        );

        return this;
    }

    public makeNormalMatrix(matrix4: Matrix4): Matrix3 {

        return this.setFromMatrix4(matrix4).invert().transpose();

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
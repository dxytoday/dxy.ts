import { Matrix3 } from "./Matrix3";
import { Quaternion } from "./Quaternion";
import { Vector3 } from "./Vector3";

export class Matrix4 {

    public constructor(

        public readonly elements = [

            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,

        ]

    ) { }


    public set(matrix4: Matrix4): Matrix4;
    public set(
        n11: number, n12: number, n13: number, n14: number,
        n21: number, n22: number, n23: number, n24: number,
        n31: number, n32: number, n33: number, n34: number,
        n41: number, n42: number, n43: number, n44: number,
    ): Matrix4;
    public set(): Matrix4 {

        const arg0 = arguments[0];

        if (arg0 instanceof Matrix4) {

            this.elements.length = 0;
            this.elements.push(...arg0.elements);

        } else if (arguments.length >= 16) {

            this.elements[0] = arg0;
            this.elements[1] = arguments[1];
            this.elements[2] = arguments[2];
            this.elements[3] = arguments[3];
            this.elements[4] = arguments[4];
            this.elements[5] = arguments[5];
            this.elements[6] = arguments[6];
            this.elements[7] = arguments[7];
            this.elements[8] = arguments[8];
            this.elements[9] = arguments[9];
            this.elements[10] = arguments[10];
            this.elements[11] = arguments[11];
            this.elements[12] = arguments[12];
            this.elements[13] = arguments[13];
            this.elements[14] = arguments[14];
            this.elements[15] = arguments[15];

        }

        return this;

    }

    public multiply(right: Matrix4): Matrix4 {

        /** this = this * right , this 在左 , right 在右 */

        const te = this.elements.slice();
        const re = right.elements.slice();

        this.elements[0] = te[0] * re[0] + te[1] * re[4] + te[2] * re[8] + te[3] * re[12];
        this.elements[1] = te[0] * re[1] + te[1] * re[5] + te[2] * re[9] + te[3] * re[13];
        this.elements[2] = te[0] * re[2] + te[1] * re[6] + te[2] * re[10] + te[3] * re[14];
        this.elements[3] = te[0] * re[3] + te[1] * re[7] + te[2] * re[11] + te[3] * re[15];

        this.elements[4] = te[4] * re[0] + te[5] * re[4] + te[6] * re[8] + te[7] * re[12];
        this.elements[5] = te[4] * re[1] + te[5] * re[5] + te[6] * re[9] + te[7] * re[13];
        this.elements[6] = te[4] * re[2] + te[5] * re[6] + te[6] * re[10] + te[7] * re[14];
        this.elements[7] = te[4] * re[3] + te[5] * re[7] + te[6] * re[11] + te[7] * re[15];

        this.elements[8] = te[8] * re[0] + te[9] * re[4] + te[10] * re[8] + te[11] * re[12];
        this.elements[9] = te[8] * re[1] + te[9] * re[5] + te[10] * re[9] + te[11] * re[13];
        this.elements[10] = te[8] * re[2] + te[9] * re[6] + te[10] * re[10] + te[11] * re[14];
        this.elements[11] = te[8] * re[3] + te[9] * re[7] + te[10] * re[11] + te[11] * re[15];

        this.elements[12] = te[12] * re[0] + te[13] * re[4] + te[14] * re[8] + te[15] * re[12];
        this.elements[13] = te[12] * re[1] + te[13] * re[5] + te[14] * re[9] + te[15] * re[13];
        this.elements[14] = te[12] * re[2] + te[13] * re[6] + te[14] * re[10] + te[15] * re[14];
        this.elements[15] = te[12] * re[3] + te[13] * re[7] + te[14] * re[11] + te[15] * re[15];

        return this;

    }

    public compose(position: Vector3, rotation: Quaternion, scale: Vector3): Matrix4 {

        /** 
         * 
         * 在四元数旋转矩阵的基础上
         * 再叠加缩放值到对应元素中
         * 再设置平移值到对应元素中
         * 
         */

        const te = this.elements;

        const x = rotation.x;
        const y = rotation.y;
        const z = rotation.z;
        const w = rotation.w;

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

        const sx = scale.x;
        const sy = scale.y;
        const sz = scale.z;

        te[0] = (1 - (yy + zz)) * sx;
        te[1] = (xy + wz) * sx;
        te[2] = (xz - wy) * sx;
        te[3] = 0;

        te[4] = (xy - wz) * sy;
        te[5] = (1 - (xx + zz)) * sy;
        te[6] = (yz + wx) * sy;
        te[7] = 0;

        te[8] = (xz + wy) * sz;
        te[9] = (yz - wx) * sz;
        te[10] = (1 - (xx + yy)) * sz;
        te[11] = 0;

        te[12] = position.x;
        te[13] = position.y;
        te[14] = position.z;
        te[15] = 1;

        return this;

    }

    public invert(): Matrix4 {

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

        const n11 = te[0], n12 = te[1], n13 = te[2], n14 = te[3];
        const n21 = te[4], n22 = te[5], n23 = te[6], n24 = te[7];
        const n31 = te[8], n32 = te[9], n33 = te[10], n34 = te[11];
        const n41 = te[12], n42 = te[13], n43 = te[14], n44 = te[15];

        const t11 = n32 * n43 * n24 - n42 * n33 * n24 + n42 * n23 * n34 - n22 * n43 * n34 - n32 * n23 * n44 + n22 * n33 * n44;
        const t12 = n41 * n33 * n24 - n31 * n43 * n24 - n41 * n23 * n34 + n21 * n43 * n34 + n31 * n23 * n44 - n21 * n33 * n44;
        const t13 = n31 * n42 * n24 - n41 * n32 * n24 + n41 * n22 * n34 - n21 * n42 * n34 - n31 * n22 * n44 + n21 * n32 * n44;
        const t14 = n41 * n32 * n23 - n31 * n42 * n23 - n41 * n22 * n33 + n21 * n42 * n33 + n31 * n22 * n43 - n21 * n32 * n43;

        const det = n11 * t11 + n12 * t12 + n13 * t13 + n14 * t14;

        if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

        const detInv = 1 / det;

        te[0] = t11 * detInv;
        te[1] = (n42 * n33 * n14 - n32 * n43 * n14 - n42 * n13 * n34 + n12 * n43 * n34 + n32 * n13 * n44 - n12 * n33 * n44) * detInv;
        te[2] = (n22 * n43 * n14 - n42 * n23 * n14 + n42 * n13 * n24 - n12 * n43 * n24 - n22 * n13 * n44 + n12 * n23 * n44) * detInv;
        te[3] = (n32 * n23 * n14 - n22 * n33 * n14 - n32 * n13 * n24 + n12 * n33 * n24 + n22 * n13 * n34 - n12 * n23 * n34) * detInv;

        te[4] = t12 * detInv;
        te[5] = (n31 * n43 * n14 - n41 * n33 * n14 + n41 * n13 * n34 - n11 * n43 * n34 - n31 * n13 * n44 + n11 * n33 * n44) * detInv;
        te[6] = (n41 * n23 * n14 - n21 * n43 * n14 - n41 * n13 * n24 + n11 * n43 * n24 + n21 * n13 * n44 - n11 * n23 * n44) * detInv;
        te[7] = (n21 * n33 * n14 - n31 * n23 * n14 + n31 * n13 * n24 - n11 * n33 * n24 - n21 * n13 * n34 + n11 * n23 * n34) * detInv;

        te[8] = t13 * detInv;
        te[9] = (n41 * n32 * n14 - n31 * n42 * n14 - n41 * n12 * n34 + n11 * n42 * n34 + n31 * n12 * n44 - n11 * n32 * n44) * detInv;
        te[10] = (n21 * n42 * n14 - n41 * n22 * n14 + n41 * n12 * n24 - n11 * n42 * n24 - n21 * n12 * n44 + n11 * n22 * n44) * detInv;
        te[11] = (n31 * n22 * n14 - n21 * n32 * n14 - n31 * n12 * n24 + n11 * n32 * n24 + n21 * n12 * n34 - n11 * n22 * n34) * detInv;

        te[12] = t14 * detInv;
        te[13] = (n31 * n42 * n13 - n41 * n32 * n13 + n41 * n12 * n33 - n11 * n42 * n33 - n31 * n12 * n43 + n11 * n32 * n43) * detInv;
        te[14] = (n41 * n22 * n13 - n21 * n42 * n13 - n41 * n12 * n23 + n11 * n42 * n23 + n21 * n12 * n43 - n11 * n22 * n43) * detInv;
        te[15] = (n21 * n32 * n13 - n31 * n22 * n13 + n31 * n12 * n23 - n11 * n32 * n23 - n21 * n12 * n33 + n11 * n22 * n33) * detInv;

        return this;

    }

    public determinant(): number {

        /* 以扩展形式的矩阵行列式求值 */

        const te = this.elements;

        const n11 = te[0], n21 = te[1], n31 = te[2], n41 = te[3];

        const n12 = te[4], n22 = te[5], n32 = te[6], n42 = te[7];

        const n13 = te[8], n23 = te[9], n33 = te[10], n43 = te[11];

        const n14 = te[12], n24 = te[13], n34 = te[14], n44 = te[15];

        return (

            n41 * (

                +n14 * n23 * n32 -
                n13 * n24 * n32 -
                n14 * n22 * n33 +
                n12 * n24 * n33 +
                n13 * n22 * n34 -
                n12 * n23 * n34

            )

            +

            n42 * (

                +n11 * n23 * n34 -
                n11 * n24 * n33 +
                n14 * n21 * n33 -
                n13 * n21 * n34 +
                n13 * n24 * n31 -
                n14 * n23 * n31

            )

            +

            n43 * (

                +n11 * n24 * n32 -
                n11 * n22 * n34 -
                n14 * n21 * n32 +
                n12 * n21 * n34 +
                n14 * n22 * n31 -
                n12 * n24 * n31

            )

            +

            n44 * (

                -n13 * n22 * n31 -
                n11 * n23 * n32 +
                n11 * n22 * n33 +
                n13 * n21 * n32 -
                n12 * n21 * n33 +
                n12 * n23 * n31

            )

        );

    }

    public getLinearMatrix(target = new Matrix3()): Matrix3 {

        const me = this.elements;

        return target.set(

            me[0], me[1], me[2],
            me[4], me[5], me[6],
            me[8], me[9], me[10],

        );

    }

    public makePerspective(

        left: number,
        right: number,
        top: number,
        bottom: number,
        near: number,
        far: number,

    ) {

        /**
         * 
         * 计算透视投影矩阵
         * 
         * 先将平头锥体计算为正方体
         * 		使用 near 范围的 left, right, top, bottom
         * 		计算线性到 far 范围内的 xy 平面上的缩放
         * 
         * 再将正方体缩放到 -1 到 1 范围内
         * 
         */

        const te = this.elements;

        const x = (2 * near) / (right - left);
        const y = (2 * near) / (top - bottom);

        const a = (right + left) / (right - left);
        const b = (top + bottom) / (top - bottom);
        const c = -(far + near) / (far - near);
        const d = (-2 * far * near) / (far - near);

        te[0] = x, te[1] = 0, te[2] = 0, te[3] = 0;
        te[4] = 0, te[5] = y, te[6] = 0, te[7] = 0;
        te[8] = a, te[9] = b, te[10] = c, te[11] = -1;
        te[12] = 0, te[13] = 0, te[14] = d, te[15] = 0;

    }

    public equals(m: Matrix4): boolean {

        const te = this.elements;
        const me = m.elements;

        for (let ii = 0; ii < 16; ii++) {

            if (te[ii] !== me[ii]) {

                return false;

            }

        }

        return true;
    }

}
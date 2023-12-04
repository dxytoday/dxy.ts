import { Matrix4 } from "./Matrix4";

/** 3*3 矩阵 - 列序为主 */
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

		const te = this.elements;

		te[0] = n11, te[1] = n12, te[2] = n13;
		te[3] = n21, te[4] = n22, te[5] = n23;
		te[6] = n31, te[7] = n32, te[8] = n33;

		return this;

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

	public copy(m: Matrix3): Matrix3 {

		const te = this.elements;
		let me = m.elements;

		te[0] = me[0];
		te[1] = me[1];
		te[2] = me[2];

		te[3] = me[3];
		te[4] = me[4];
		te[5] = me[5];

		te[6] = me[6];
		te[7] = me[7];
		te[8] = me[8];

		return this;

	}

	public toArray(array: number[] = [], offset = 0): number[] {

		const te = this.elements;

		array[offset] = te[0];
		array[offset + 1] = te[1];
		array[offset + 2] = te[2];

		array[offset + 3] = te[3];
		array[offset + 4] = te[4];
		array[offset + 5] = te[5];

		array[offset + 6] = te[6];
		array[offset + 7] = te[7];
		array[offset + 8] = te[8];

		return array;

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
		 * 注意：本方法以扩展形式的矩阵行列式求值
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
		 * 0  1  2
		 * 3  4  5
		 * 6  7  8
		 * 
		 * 转换成 
		 * 
		 * 0  3  6
		 * 1  4  7
		 * 2  5  8
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

	public setFromMatrix4(m: Matrix4): Matrix3 {

		const me = m.elements;

		this.set(

			me[0], me[1], me[2],
			me[4], me[5], me[6],
			me[8], me[9], me[10],

		);

		return this;

	}

	public setNormalMatrix(matrix4: Matrix4): Matrix3 {

		return this.setFromMatrix4(matrix4).invert().transpose();

	}


}
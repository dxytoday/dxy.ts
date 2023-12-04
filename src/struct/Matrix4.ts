import { Quaternion } from "./Quaternion";
import { Vector3 } from "./Vector3";

const _up = /*@__PURE__*/ new Vector3(0, 1, 0);

const _z = /*@__PURE__*/ new Vector3();
const _x = /*@__PURE__*/ new Vector3();
const _y = /*@__PURE__*/ new Vector3();

/** 4*4 矩阵 - 列序为主 */
export class Matrix4 {

	public constructor(

		public readonly elements = [

			1, 0, 0, 0,

			0, 1, 0, 0,

			0, 0, 1, 0,

			0, 0, 0, 1,

		]

	) { }

	public set(

		n11: number, n12: number, n13: number, n14: number,
		n21: number, n22: number, n23: number, n24: number,
		n31: number, n32: number, n33: number, n34: number,
		n41: number, n42: number, n43: number, n44: number,

	): Matrix4 {

		const te = this.elements;

		te[0] = n11, te[1] = n12, te[2] = n13, te[3] = n14;
		te[4] = n21, te[5] = n22, te[6] = n23, te[7] = n24;
		te[8] = n31, te[9] = n32, te[10] = n33, te[11] = n34;
		te[12] = n41, te[13] = n42, te[14] = n43, te[15] = n44;

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

	public multiplyMatrices(a: Matrix4, b: Matrix4): Matrix4 {

		/** 
		 * 
		 * b 左乘 a - 自左向右（b 在左 a 在右） 
		 * 
		 * b * a
		 * 
		 */

		const ae = a.elements;
		const be = b.elements;
		const te = this.elements;

		const a11 = ae[0], a12 = ae[1], a13 = ae[2], a14 = ae[3];
		const a21 = ae[4], a22 = ae[5], a23 = ae[6], a24 = ae[7];
		const a31 = ae[8], a32 = ae[9], a33 = ae[10], a34 = ae[11];
		const a41 = ae[12], a42 = ae[13], a43 = ae[14], a44 = ae[15];

		const b11 = be[0], b12 = be[1], b13 = be[2], b14 = be[3];
		const b21 = be[4], b22 = be[5], b23 = be[6], b24 = be[7];
		const b31 = be[8], b32 = be[9], b33 = be[10], b34 = be[11];
		const b41 = be[12], b42 = be[13], b43 = be[14], b44 = be[15];

		te[0] = b11 * a11 + b12 * a21 + b13 * a31 + b14 * a41;
		te[1] = b11 * a12 + b12 * a22 + b13 * a32 + b14 * a42;
		te[2] = b11 * a13 + b12 * a23 + b13 * a33 + b14 * a43;
		te[3] = b11 * a14 + b12 * a24 + b13 * a34 + b14 * a44;

		te[4] = b21 * a11 + b22 * a21 + b23 * a31 + b24 * a41;
		te[5] = b21 * a12 + b22 * a22 + b23 * a32 + b24 * a42;
		te[6] = b21 * a13 + b22 * a23 + b23 * a33 + b24 * a43;
		te[7] = b21 * a14 + b22 * a24 + b23 * a34 + b24 * a44;

		te[8] = b31 * a11 + b32 * a21 + b33 * a31 + b34 * a41;
		te[9] = b31 * a12 + b32 * a22 + b33 * a32 + b34 * a42;
		te[10] = b31 * a13 + b32 * a23 + b33 * a33 + b34 * a43;
		te[11] = b31 * a14 + b32 * a24 + b33 * a34 + b34 * a44;

		te[12] = b41 * a11 + b42 * a21 + b43 * a31 + b44 * a41;
		te[13] = b41 * a12 + b42 * a22 + b43 * a32 + b44 * a42;
		te[14] = b41 * a13 + b42 * a23 + b43 * a33 + b44 * a43;
		te[15] = b41 * a14 + b42 * a24 + b43 * a34 + b44 * a44;

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
		 * 注意：本方法以扩展形式的矩阵行列式求值
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

	public copy(m: Matrix4): Matrix4 {

		const te = this.elements;
		const me = m.elements;

		te[0] = me[0];
		te[1] = me[1];
		te[2] = me[2];
		te[3] = me[3];

		te[4] = me[4];
		te[5] = me[5];
		te[6] = me[6];
		te[7] = me[7];

		te[8] = me[8];
		te[9] = me[9];
		te[10] = me[10];
		te[11] = me[11];

		te[12] = me[12];
		te[13] = me[13];
		te[14] = me[14];
		te[15] = me[15];

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
		array[offset + 9] = te[9];
		array[offset + 10] = te[10];
		array[offset + 11] = te[11];

		array[offset + 12] = te[12];
		array[offset + 13] = te[13];
		array[offset + 14] = te[14];
		array[offset + 15] = te[15];

		return array;

	}

	public lookAt(eye: Vector3, target: Vector3) {

		_z.subVectors(eye, target);

		if (_z.length() === 0) {

			_z.z = 1;

		}

		_z.normalize();
		_x.crossVectors(_up, _z);

		if (_x.lengthSq() === 0) {

			_z.z += 0.0001;

			_z.normalize();
			_x.crossVectors(_up, _z);

		}

		_x.normalize();

		_y.crossVectors(_z, _x);

		this.elements[0] = _x.x;
		this.elements[4] = _y.x;
		this.elements[8] = _z.x;
		this.elements[1] = _x.y;
		this.elements[5] = _y.y;
		this.elements[9] = _z.y;
		this.elements[2] = _x.z;
		this.elements[6] = _y.z;
		this.elements[10] = _z.z;

	}

	/** 行列式的值 */
	public determinant(): number {

		/* 以扩展形式的矩阵行列式求值 */

		const te = this.elements;

		const n11 = te[0], n21 = te[1], n31 = te[2], n41 = te[3];

		const n12 = te[4], n22 = te[5], n32 = te[6], n42 = te[7];

		const n13 = te[8], n23 = te[9], n33 = te[10], n43 = te[11];

		const n14 = te[12], n24 = te[13], n34 = te[14], n44 = te[15];

		return (

			n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34)

			+

			n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31)

			+

			n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31)

			+

			n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31)

		);

	}

}

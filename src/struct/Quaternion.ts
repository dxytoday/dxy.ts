import { Util } from "../bases/Util";
import { Matrix4 } from "./Matrix4";

class Quaternion {

	public constructor(

		public x = 0,
		public y = 0,
		public z = 0,
		public w = 1,

	) { }

	public fromArray(array: number[], offset = 0): Quaternion {

		this.x = array[offset];
		this.y = array[offset + 1];
		this.z = array[offset + 2];
		this.w = array[offset + 3];

		return this;
	}

	public setFromEuler(x: number, y: number, z: number): Quaternion {

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

	public setFromMatrix(m: Matrix4): Quaternion {

		const te = m.elements;
		const m11 = te[0];
		const m12 = te[4];
		const m13 = te[8];
		const m21 = te[1];
		const m22 = te[5];
		const m23 = te[9];
		const m31 = te[2];
		const m32 = te[6];
		const m33 = te[10];

		const trace = m11 + m22 + m33;

		if (trace > 0) {

			const s = 0.5 / Math.sqrt(trace + 1.0);

			this.w = 0.25 / s;
			this.x = (m32 - m23) * s;
			this.y = (m13 - m31) * s;
			this.z = (m21 - m12) * s;

		} else if (m11 > m22 && m11 > m33) {

			const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

			this.w = (m32 - m23) / s;
			this.x = 0.25 * s;
			this.y = (m12 + m21) / s;
			this.z = (m13 + m31) / s;

		} else if (m22 > m33) {

			const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

			this.w = (m13 - m31) / s;
			this.x = (m12 + m21) / s;
			this.y = 0.25 * s;
			this.z = (m23 + m32) / s;

		} else {

			const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

			this.w = (m21 - m12) / s;
			this.x = (m13 + m31) / s;
			this.y = (m23 + m32) / s;
			this.z = 0.25 * s;

		}

		return this;

	}

	public toEuler(

		euler = {

			x: 0,
			y: 0,
			z: 0,

		}

	): { x: number, y: number, z: number } {

		const x2 = this.x + this.x;
		const y2 = this.y + this.y;
		const z2 = this.z + this.z;

		const x_x2 = this.x * x2;
		const x_y2 = this.x * y2;
		const x_z2 = this.x * z2;
		const y_y2 = this.y * y2;
		const y_z2 = this.y * z2;
		const z_z2 = this.z * z2;
		const w_x2 = this.w * x2;
		const w_y2 = this.w * y2;
		const w_z2 = this.w * z2;

		const m11 = (1 - (y_y2 + z_z2));
		const m12 = (x_y2 - w_z2);
		const m13 = (x_z2 + w_y2);

		const m22 = (1 - (x_x2 + z_z2));
		const m23 = (y_z2 - w_x2);

		const m32 = (y_z2 + w_x2);
		const m33 = (1 - (x_x2 + y_y2));

		euler.y = Math.asin(Util.clamp(m13, -1, 1));

		if (Math.abs(m13) < 0.9999999) {

			euler.x = Math.atan2(-m23, m33);
			euler.z = Math.atan2(-m12, m11);

		} else {

			euler.x = Math.atan2(m32, m22);
			euler.z = 0;

		}

		return euler;

	}

}

export { Quaternion };
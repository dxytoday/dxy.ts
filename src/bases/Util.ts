export class Util {

	public static readonly BYTE = 5120;
	public static readonly UNSIGNED_BYTE = 5121;
	public static readonly SHORT = 5122;
	public static readonly UNSIGNED_SHORT = 5123;
	public static readonly INT = 5124
	public static readonly UNSIGNED_INT = 5125;
	public static readonly FLOAT = 5126;
	public static readonly BOOL = 35670;
	public static readonly FLOAT_VEC2 = 35664;
	public static readonly INT_VEC2 = 35667;
	public static readonly BOOL_VEC2 = 35671;
	public static readonly FLOAT_VEC3 = 35665;
	public static readonly INT_VEC3 = 35668;
	public static readonly BOOL_VEC3 = 35672;
	public static readonly FLOAT_VEC4 = 35666;
	public static readonly INT_VEC4 = 35669;
	public static readonly BOOL_VEC4 = 35673;
	public static readonly FLOAT_MAT3 = 35675;
	public static readonly FLOAT_MAT4 = 35676;
	public static readonly SAMPLER_2D = 35678;

	public static readonly POINTS = 0;
	public static readonly LINES = 1;
	public static readonly TRIANGLES = 4;

	public static readonly TEXTURE_2D = 3553;

	public static readonly ARRAY_BUFFER = 34962;
	public static readonly ELEMENT_ARRAY_BUFFER = 34963;

	public static readonly STATIC_DRAW = 35044;

	public static readonly NEAREST = 9728; 					// 从最大的贴图中选择 1 个像素
	public static readonly LINEAR = 9729; 					// 从最大的贴图中选择 4 个像素然后混合
	public static readonly NEAREST_MIPMAP_NEAREST = 9984; 	// 选择最合适的贴图，然后从上面找到一个像素
	public static readonly LINEAR_MIPMAP_NEAREST = 9985; 	// 选择最合适的贴图，然后取出 4 个像素进行混合
	public static readonly NEAREST_MIPMAP_LINEAR = 9986; 	// 选择最合适的两个贴图，从每个上面选择 1 个像素然后混合
	public static readonly LINEAR_MIPMAP_LINEAR = 9987; 	// 选择最合适的两个贴图，从每个上选择 4 个像素然后混合

	public static readonly REPEAT = 10497;
	public static readonly CLAMP_TO_EDGE = 33071;
	public static readonly MIRRORED_REPEAT = 33648;

	public static typedArrayMapping = new Map<Function, number>(

		[
			[Int8Array, Util.BYTE],
			[Uint8Array, Util.UNSIGNED_BYTE],
			[Int16Array, Util.SHORT],
			[Uint16Array, Util.UNSIGNED_SHORT],
			[Uint32Array, Util.UNSIGNED_INT],
			[Float32Array, Util.FLOAT],
		]

	);

	public static clamp(value: number, min: number, max: number): number {

		return Math.max(min, Math.min(max, value));

	}

}

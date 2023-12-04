declare type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Uint32Array | Float32Array;

declare type ImageType = HTMLImageElement | ImageBitmap;

declare class RenderGroup {

	start: number;
	count: number;
	materialIndex: number;

}

type AnyEvent = {

	type: string;
	source?: object;
	[propName: string]: any;

};

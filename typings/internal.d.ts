declare type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Uint32Array | Float32Array;

declare type ImageType = HTMLImageElement | ImageBitmap;

declare class RenderGroup {

	start: number;
	count: number;
	materialIndex: number;

}

declare interface IAnyEvent {

	type: string;
	source?: object;
	[propName: string]: any;

}

declare interface IDomEvent extends IAnyEvent {

	event?: Event

}


declare type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Uint32Array | Float32Array;

declare interface DataImage {

    width: number,
    height: number,

}

declare type TexImage = HTMLImageElement | ImageBitmap;

declare interface Mapping {

    [propName: string]: any;
    [propIndex: number]: any;

}

declare interface EventParameters {

    source?: object;
    [propName: string]: any;

}

declare interface RenderGroup {

    start: number;
    count: number;
    materialIndex: number;

}

declare interface IUniform<T = any> {

    value: T;
    needsUpdate?: boolean;

}

declare interface RenderItem {

    mesh?: object;
    geometry?: object;
    material?: object;
    group?: RenderGroup;

}

declare interface RenderList {

    opaque: RenderItem[];
    transparent: RenderItem[];

}

declare interface ProgramObject {

    program: WebGLProgram;
    vertexShader: WebGLShader;
    fragmentShader: WebGLShader;
    attributes: object[];
    uniforms: object[];

}

declare interface BufferPointer {

    buffer?: WebGLBuffer;
    size?: number;
    type?: number;
    normalized?: boolean;

}

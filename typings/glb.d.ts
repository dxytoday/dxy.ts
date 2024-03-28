declare interface GLBSampler {

    magFilter: number;
    minFilter: number;
    wrapS: number;
    wrapT: number;

}

declare interface GLBImage {

    bufferView: number;
    mimeType: string;

    instance?: any;

}

declare interface GLBTexture {

    source: number;
    sampler: number;

    instance?: any;

}

declare interface GLBBaseColorTexture {

    index: number;

}

declare interface GLBMetallicRoughnessTexture {

    index: number;

}

declare interface GLBPBRMetallicRoughness {

    baseColorFactor?: number[];
    baseColorTexture?: GLBBaseColorTexture;
    metallicFactor?: number;
    roughnessFactor?: number;
    metallicRoughnessTexture?: GLBMetallicRoughnessTexture;

}

declare interface GLBNormalTexture {

    index: number;
    scale?: number;

}

declare interface GLBMaterial {

    name: string;
    pbrMetallicRoughness: GLBPBRMetallicRoughness;
    doubleSided: boolean;
    alphaMode?: string;
    normalTexture?: GLBNormalTexture;

    occlusionTexture?: number;
    emissiveFactor?: number;
    emissiveTexture?: number;

    extensions?: any;

    instance?: any;

}

declare interface GLBBufferView {

    byteLength: number;
    byteOffset: number;

    instance?: any;

}

declare interface GLBAccessor {

    bufferView: number;
    type: string;
    componentType: number;
    count: number;
    byteOffset: number;
    normalized?: boolean;

    instance?: any

}

declare interface GLBPrimitive {

    attributes: { [name: string]: number };
    indices?: number;
    mode?: number;
    material?: number;

}

declare interface GLBMesh {

    name: string;
    primitives: GLBPrimitive[];

    instance?: any;

}

declare interface GLBNode {

    name: string;
    mesh: number;
    children?: number[];
    translation?: number[];
    rotation?: number[];
    scale?: number[];

    instance?: any;

}

declare interface GLBScene {

    name: string;
    nodes: number[];

}

declare interface GLBAsset {

    generator: string;
    version: string;

}

declare interface GLBObject {

    asset: GLBAsset;
    scene: number;
    scenes: GLBScene[];
    nodes: GLBNode[];
    meshes: GLBMesh[];
    accessors: GLBAccessor[];
    bufferViews: GLBBufferView[];
    materials: GLBMaterial[];
    textures: GLBTexture[];
    images: GLBImage[];
    samplers: GLBSampler[];

}
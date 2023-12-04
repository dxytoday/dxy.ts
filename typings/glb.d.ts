declare type GLBSampler = {

	magFilter: number;
	minFilter: number;
	wrapS: number;
	wrapT: number;

}

declare type GLBImage = {

	bufferView: number;
	mimeType: string;

	instance?: any;

}

declare type GLBTexture = {

	source: number;
	sampler: number;

	instance?: any;

}

declare type GLBBaseColorTexture = {

	index: number;

}

declare type GLBMetallicRoughnessTexture = {

	index: number;

}

declare type GLBPBRMetallicRoughness = {

	baseColorFactor?: number[];
	baseColorTexture?: GLBBaseColorTexture;
	metallicFactor?: number;
	roughnessFactor?: number;
	metallicRoughnessTexture?: GLBMetallicRoughnessTexture;

}

declare type GLBNormalTexture = {

	index: number;
	scale?: number;

}

declare type GLBMaterial = {

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

declare type GLBBufferView = {

	byteLength: number;
	byteOffset: number;

	instance?: any;

}

declare type GLBAccessor = {

	bufferView: number;
	type: string;
	componentType: number;
	count: number;
	byteOffset: number;
	normalized?: boolean;

	instance?: any

}

declare type GLBPrimitive = {

	attributes: { [name: string]: number };
	indices?: number;
	mode?: number;
	material?: number;

}

declare type GLBMesh = {

	name: string;
	primitives: GLBPrimitive[];

	instance?: any;

}

declare type GLBNode = {

	name: string;
	mesh: number;
	children?: number[];
	translation?: number[];
	rotation?: number[];
	scale?: number[];

	instance?: any;

}

declare type GLBScene = {

	name: string;
	nodes: number[];

}

declare type GLBAsset = {

	generator: string;
	version: string;

}

declare type GLBObject = {

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
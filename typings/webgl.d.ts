declare module "*.glsl" {
	const content: string;
	export default content;
}

declare type ShaderSources = {

	vertex: string;
	fragment: string;

}

declare type PointerInfo = {

	buffer?: WebGLBuffer;
	size?: number;
	type?: number;
	normalized?: boolean;

}

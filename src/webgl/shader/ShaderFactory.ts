import { LineMaterial } from "../../objects/modules/Material";
import { MeshMaterial } from "../../objects/modules/Material";
import { PointsMaterial } from "../../objects/modules/Material";
import { SpriteMaterial } from "../../objects/modules/Material";
import { WebGLObject } from "../WebGLObject";
import mesh_vert from './mesh.vert';
import mesh_frag from './mesh.frag';

export class ShaderFactory {

	private static cache = new Map<string, ShaderSources>();

	public static getShaderSources(object: WebGLObject): ShaderSources {

		let sources = this.cache.get(object.key);

		if (sources === undefined) {

			if (object.material instanceof PointsMaterial) {

				sources = this.getPointsShaderSources(object);

			} else if (object.material instanceof LineMaterial) {

				sources = this.getLineShaderSources(object);

			} else if (object.material instanceof SpriteMaterial) {

				sources = this.getSpriteShaderSources(object);

			} else if (object.material instanceof MeshMaterial) {

				sources = this.getMeshShaderSources(object);

			}

			this.cache.set(object.key, sources);

		}

		return sources;

	}

	private static getPointsShaderSources(object: WebGLObject): ShaderSources {

		return undefined;

	}

	private static getLineShaderSources(object: WebGLObject): ShaderSources {

		return undefined;

	}

	private static getSpriteShaderSources(object: WebGLObject): ShaderSources {

		return undefined;

	}

	private static getMeshShaderSources(object: WebGLObject): ShaderSources {

		const sources = { vertex: mesh_vert, fragment: mesh_frag };

		const defines = [];

		if (object.useUv) defines.push('#define US_UV');
		if (object.useNormal) defines.push('#define US_NORMAL');
		if (object.useColor) defines.push('#define US_COLOR');
		if (object.useTangent) defines.push('#define US_TANGENT');

		if (object.useMap) defines.push('#define US_MAP');
		if (object.useLightMap) defines.push('#define US_LIGHTMAP');
		if (object.useAoMap) defines.push('#define US_AOMAP');
		if (object.useEmissiveMap) defines.push('#define US_EMISSIVEMAP');
		if (object.useBumpMap) defines.push('#define US_BUMPMAP');
		if (object.useNormalMap) defines.push('#define US_NORMALMAP');
		if (object.useDisplacementMap) defines.push('#define US_DISPLACEMENTMAP');
		if (object.useRoughnessMap) defines.push('#define US_ROUGHNESSMAP');
		if (object.useMetalnessMap) defines.push('#define US_METALNESSMAP');
		if (object.useAlphaMap) defines.push('#define US_ALPHAMAP');
		if (object.useEnvMap) defines.push('#define US_ENVMAP');

		const define = defines.join('\n');

		sources.vertex = sources.vertex.replace('#define PREDEFINE', define);
		sources.fragment = sources.fragment.replace('#define PREDEFINE', define);

		return sources;

	}

}
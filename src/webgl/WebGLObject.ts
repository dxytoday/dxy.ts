import { Entity, InstancedEntity } from "../objects/Entity";
import { Geometry } from "../objects/modules/Geometry";
import { Material, MeshMaterial } from "../objects/modules/Material";

export class WebGLObject {

	public key = '';

	public entity: Entity;
	public geometry: Geometry;
	public material: Material;
	public group: RenderGroup;

	public isInstancing = false;
	public useInstancingColor = false;

	public useUv = false;
	public useNormal = false;
	public useColor = false;
	public useTangent = false;

	public useMap = false;
	public useLightMap = false;
	public useAoMap = false;
	public useEmissiveMap = false;
	public useBumpMap = false;
	public useNormalMap = false;
	public useDisplacementMap = false;
	public useRoughnessMap = false;
	public useMetalnessMap = false;
	public useAlphaMap = false;
	public useEnvMap = false;

	public vertexSource: string;
	public fragmentSource: string;

	public program: WebGLProgram;

	public use(entity: Entity, geometry: Geometry, material: Material, group?: RenderGroup): void {

		this.entity = entity;
		this.geometry = geometry;
		this.material = material;
		this.group = group;

		this.setStates();

		this.key = [

			this.material.type,
			this.isInstancing,
			this.useInstancingColor,

			this.useUv,
			this.useNormal,
			this.useColor,
			this.useTangent,

			this.useMap,
			this.useLightMap,
			this.useAoMap,
			this.useEmissiveMap,
			this.useBumpMap,
			this.useNormalMap,
			this.useDisplacementMap,
			this.useRoughnessMap,
			this.useMetalnessMap,
			this.useAlphaMap,
			this.useEnvMap,

		].join('-');

	}

	private setStates(): void {

		if (this.entity instanceof InstancedEntity) {

			this.isInstancing = true;
			this.useInstancingColor = this.entity.instanceColor !== undefined;

		} else {

			this.isInstancing = false;
			this.useInstancingColor = false;

		}

		this.useUv = this.geometry.hasAttribute('uv');
		this.useNormal = this.geometry.hasAttribute('normal');
		this.useColor = this.geometry.hasAttribute('color');
		this.useTangent = this.geometry.hasAttribute('tangent');

		this.useMap = this.useUv && this.material.map !== undefined;

		if (this.material instanceof MeshMaterial && this.useUv) {

			this.useNormalMap = this.useNormal && this.material.normalMap !== undefined;

			this.useLightMap = this.material.lightMap !== undefined;
			this.useAoMap = this.material.aoMap !== undefined;
			this.useEmissiveMap = this.material.emissiveMap !== undefined;
			this.useBumpMap = this.material.bumpMap !== undefined;
			this.useDisplacementMap = this.material.displacementMap !== undefined;
			this.useRoughnessMap = this.material.roughnessMap !== undefined;
			this.useMetalnessMap = this.material.metalnessMap !== undefined;
			this.useAlphaMap = this.material.alphaMap !== undefined;
			this.useEnvMap = this.material.envMap !== undefined;

		}

		if (this.useTangent) {

			this.useTangent = this.useNormal && this.useNormalMap;

		}

		if (this.useUv) {

			this.useUv = (

				this.useMap ||
				this.useLightMap ||
				this.useAoMap ||
				this.useEmissiveMap ||
				this.useBumpMap ||
				this.useNormalMap ||
				this.useDisplacementMap ||
				this.useRoughnessMap ||
				this.useMetalnessMap ||
				this.useAlphaMap ||
				this.useEnvMap

			);

		}


	}

	public discard(): void {

		this.entity = undefined;
		this.geometry = undefined;
		this.material = undefined;
		this.group = undefined;

		this.vertexSource = undefined;
		this.fragmentSource = undefined;

		this.program = undefined;

		this.isInstancing = false;
		this.useInstancingColor = false;

		this.useUv = false;
		this.useNormal = false;
		this.useColor = false;
		this.useTangent = false;

		this.useMap = false;
		this.useLightMap = false;
		this.useAoMap = false;
		this.useEmissiveMap = false;
		this.useBumpMap = false;
		this.useNormalMap = false;
		this.useDisplacementMap = false;
		this.useRoughnessMap = false;
		this.useMetalnessMap = false;
		this.useAlphaMap = false;
		this.useEnvMap = false;

	}

}
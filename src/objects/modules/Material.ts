import { Color } from "../../struct/Color";
import { Vector2 } from "../../struct/Vector2";
import { Texture } from "./Texture";

export abstract class Material {

	public name = '';
	public type = '';

	public opacity = 1;
	public transparent = false;

	public depthTest = true;
	public depthWrite = true;

	public backfaceCulling = true;

	public color = new Color();
	public map: Texture;

}

export class PointsMaterial extends Material {

	public override type = 'Points';

	public alphaMap: Texture;
	public size = 1;
	public sizeAttenuation = true;

}

export class LineMaterial extends Material {

	public override type = 'Line';

	public linewidth = 1;
	public linecap = 'round';
	public linejoin = 'round';

}

export class SpriteMaterial extends Material {

	public override type = 'Sprite';

	public alphaMap: Texture;
	public rotation = 0;
	public sizeAttenuation = true;

	public override transparent = true;

}

export class MeshMaterial extends Material {

	public override type = 'Mesh';

	public roughness = 1;
	public metalness = 1;

	public lightMap: Texture;
	public lightMapIntensity: number;

	public aoMap: Texture;
	public aoMapIntensity: number;

	public emissive = new Color(0, 0, 0);
	public emissiveIntensity = 1;
	public emissiveMap: Texture;

	public bumpMap: Texture;
	public bumpScale: number;

	public normalMap: Texture;
	public normalScale: Vector2;

	public displacementMap: Texture;
	public displacementScale: number;
	public displacementBias: number;

	public roughnessMap: Texture;
	public metalnessMap: Texture;
	public alphaMap: Texture;

	public envMap: Texture;
	public envMapIntensity: number;

}

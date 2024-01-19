import { Material, Uniform } from "./Material";
import vertexShader from './shaders/background.vert.glsl';
import fragmentShader from './shaders/background.frag.glsl';
import { Texture } from "../modules/Texture";

export class BgMaterial extends Material {

    public readonly mapUniform: Uniform;

    public constructor() {

        super();

        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        this.setUniform('map', undefined);
        this.mapUniform = this.getUniform('map') as Uniform;

    }

    public get map(): Texture | undefined {

        return this.mapUniform.value as Texture;

    }

    public set map(map: Texture) {

        this.mapUniform.value = map;

    }

}
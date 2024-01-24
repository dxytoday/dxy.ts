import { IUniform, Material } from "./Material";
import vertexShader from './shaders/BG.vert.glsl';
import fragmentShader from './shaders/BG.frag.glsl';
import { Texture } from "../modules/Texture";

type BGRUniforms = {

    map: IUniform<Texture | undefined>;
    isCube: IUniform<boolean>;

}

export class BGMaterial extends Material {

    declare public uniforms: BGRUniforms;

    public constructor() {

        super();

        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        this.depthTest = false;

        this.setUniform('map', undefined);
        this.setUniform('isCube', false);

    }

    public get map(): Texture | undefined {

        return this.uniforms.map.value;

    }

    public set map(map: Texture) {

        this.uniforms.map.value = map;

    }

    public get isCube(): boolean {

        return this.uniforms.isCube.value;

    }

    public set isCube(flag: boolean) {

        this.uniforms.isCube.value = !!flag;

    }

    public override dispose(): void {

        super.emit('dispose');

    }

}
import vertexShader from '../renderers/shaders/ImageMaterial.vert';
import fragmentShader from '../renderers/shaders/ImageMaterial.frag';
import { ImageTexture } from "../textures/ImageTexture";
import { Material } from "./Material";

type Uniforms = {

    map: IUniform<ImageTexture | undefined>;

}

export class ImageMaterial extends Material {

    declare public uniforms: Uniforms;

    public constructor() {

        super();

        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        this.uniforms.map = { value: undefined };

    }

    public get map(): ImageTexture | undefined {

        return this.uniforms.map.value;

    }

    public set map(map: ImageTexture) {

        this.uniforms.map.value = map;

    }

}
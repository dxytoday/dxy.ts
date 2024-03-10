import { IUniform, Material } from "../Material";
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';
import { CubeTexture, Texture } from "../../modules/Texture";
import { Camera } from "../../cameras/Camera";
import { Mesh } from "../../objects/Mesh";
import { Scene } from "../../objects/Scene";
import { Matrix4 } from "../../structs/Matrix4";

type Uniforms = {

    map: IUniform<Texture | undefined>;
    cube: IUniform<CubeTexture | undefined>;
    isCube: IUniform<boolean>;
    viewMatrix: IUniform<Matrix4>;
    projectionMatrix: IUniform<Matrix4>;
}

export class BGMaterial extends Material {

    declare public uniforms: Uniforms;

    public constructor() {

        super();

        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        this.setUniform('map', undefined);
        this.setUniform('cube', undefined);
        this.setUniform('isCube', false);
        this.setUniform('viewMatrix', new Matrix4());
        this.setUniform('projectionMatrix', new Matrix4());

    }

    public get map(): Texture | undefined {

        return this.uniforms.map.value;

    }

    public set map(map: Texture) {

        this.uniforms.map.value = map;

    }

    public get cube(): CubeTexture | undefined {

        return this.uniforms.cube.value;

    }

    public set cube(cube: CubeTexture) {

        this.uniforms.cube.value = cube;

    }

    public get isCube(): boolean {

        return this.uniforms.isCube.value;

    }

    public set isCube(flag: boolean) {

        this.uniforms.isCube.value = !!flag;

    }

    public override onBeforRender(scene: Scene, mesh: Mesh, camera: Camera): void {

        if (this.isCube) {

            this.uniforms.viewMatrix.value.copy(camera.viewMatrix);
            this.uniforms.projectionMatrix.value.copy(camera.projectionMatrix);

        }

    }

    public override dispose(): void {

        super.emit('dispose');

    }

}
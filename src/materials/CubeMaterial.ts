import vertexShader from '../renderers/shaders/CubeMaterial.vert';
import fragmentShader from '../renderers/shaders/CubeMaterial.frag';
import { Matrix4 } from "../math/Matrix4";
import { CubeTexture } from "../textures/CubeTexture";
import { Material } from "./Material";
import { Camera } from "../cameras/Camera";
import { Mesh } from "../objects/Mesh";
import { Scene } from "../objects/Scene";

type Uniforms = {

    cube: IUniform<CubeTexture | undefined>;
    viewMatrix: IUniform<Matrix4>;
    projectionMatrix: IUniform<Matrix4>;

}

export class CubeMaterial extends Material {

    declare public uniforms: Uniforms;

    public constructor() {

        super();

        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        this.uniforms.cube = { value: undefined };
        this.uniforms.viewMatrix = { value: new Matrix4() };
        this.uniforms.projectionMatrix = { value: new Matrix4() };

    }

    public get cube(): CubeTexture | undefined {

        return this.uniforms.cube.value;

    }

    public set cube(cube: CubeTexture) {

        this.uniforms.cube.value = cube;

    }

    public override onBeforRender(scene: Scene, mesh: Mesh, camera: Camera): void {

        this.uniforms.viewMatrix.value.copy(camera.viewMatrix);
        this.uniforms.projectionMatrix.value.copy(camera.projectionMatrix);

    }

}
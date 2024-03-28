import vertexShader from '../renderers/shaders/DepthMaterial.vert';
import fragmentShader from '../renderers/shaders/DepthMaterial.frag';
import { Material } from "./Material";
import { Matrix4 } from "../math/Matrix4";
import { Scene } from '../objects/Scene';
import { Mesh } from '../objects/Mesh';
import { Camera } from '../cameras/Camera';

type Uniforms = {

    opacity: IUniform<number>;
    modelViewMatrix: IUniform<Matrix4>;
    projectionMatrix: IUniform<Matrix4>;

}

export class DepthMaterial extends Material {

    declare public uniforms: Uniforms;

    public opacity = 1;

    public constructor() {

        super();

        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        this.uniforms.opacity = { value: this.opacity };
        this.uniforms.modelViewMatrix = { value: new Matrix4() };
        this.uniforms.projectionMatrix = { value: new Matrix4() };

    }

    public override onBeforRender(scene: Scene, mesh: Mesh, camera: Camera): void {

        this.uniforms.opacity.value = this.opacity;

        this.uniforms.modelViewMatrix.value.multiplyMatrices(mesh.worldMatrix, camera.viewMatrix);

        this.uniforms.projectionMatrix.value.copy(camera.projectionMatrix);

    }

}
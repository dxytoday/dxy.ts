import { Mesh } from "../objects/Mesh";
import { Camera } from "../cameras/Camera";
import { Scene } from "../objects/Scene";

export abstract class Material {

    public readonly uniforms: { [key: string]: IUniform; } = {};

    public name = '';

    public transparent = false;
    public backfaceCulling = true;

    public vertexShader = '';
    public fragmentShader = '';

    public getUniform(name: string): IUniform | undefined {

        return this.uniforms[name];

    }

    public onBeforRender(scene: Scene, mesh: Mesh, camera: Camera): void { }

}
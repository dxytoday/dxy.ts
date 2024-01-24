import { EventObject } from "../modules/EventObject";
import { Mesh } from "../objects/Mesh";
import { Camera } from "../objects/Camera";
import { Scene } from "../objects/Scene";

export interface IUniform<T = any> {

    value: T,
    needsUpdate?: boolean

}

export abstract class Material extends EventObject {

    public readonly uniforms: { [key: string]: IUniform; } = {};

    public name = '';

    public transparent = false;

    public depthTest = true;
    public backfaceCulling = true;

    public vertexShader = '';
    public fragmentShader = '';

    public setUniform(name: string, value: any): Material {

        this.uniforms[name] = { value: value };
        return this;

    }

    public getUniform(name: string): IUniform | undefined {

        return this.uniforms[name];

    }

    public onBeforRender(scene: Scene, mesh: Mesh, camera: Camera): void { }

    public dispose(): void {

        this.emit('dispose');

    }

}
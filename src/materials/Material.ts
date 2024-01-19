import { EventObject } from "../modules/EventObject";
import { Matrix3 } from "../structs/Matrix3";
import { Matrix4 } from "../structs/Matrix4";
import { Texture } from "../modules/Texture";
import { Vector2 } from "../structs/Vector2";
import { Vector3 } from "../structs/Vector3";
import { Mesh } from "../objects/Mesh";
import { Camera } from "../objects/Camera";
import { Scene } from "../objects/Scene";

export type UniformValue = undefined | number | boolean | Vector2 | Vector3 | Matrix3 | Matrix4 | Texture;

export type Uniform = {

    value: UniformValue;
    needsUpdate?: boolean;

}

export abstract class Material extends EventObject {

    public readonly uniforms = new Map<string, Uniform>();

    public name = '';

    public transparent = false;
    public backfaceCulling = true;

    public vertexShader = '';
    public fragmentShader = '';

    public setUniform(name: string, value: UniformValue): Material {

        this.uniforms.set(name, { value: value });
        return this;

    }

    public getUniform(name: string): Uniform | undefined {

        return this.uniforms.get(name);

    }

    public onBeforRender(scene: Scene, mesh: Mesh, camera: Camera): void { }

    public dispose(): void {

        this.emit('dispose');

    }

}
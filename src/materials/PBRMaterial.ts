import { Color } from "../structs/Color";
import { Material } from "./Material";
import vertexShader from './shaders/pbr.vert.glsl';
import fragmentShader from './shaders/pbr.frag.glsl';
import { Texture } from "../modules/Texture";
import { Mesh } from "../objects/Mesh";
import { Camera } from "../objects/Camera";
import { Matrix4 } from "../structs/Matrix4";
import { Matrix3 } from "../structs/Matrix3";
import { Scene } from "../objects/Scene";

export class PBRMaterial extends Material {

    public opacity = 1;
    public color = new Color(1, 1, 1);

    public map: Texture | undefined;

    public roughness = 1;
    public roughnessMap: Texture | undefined;

    public metalness = 0;
    public metalnessMap: Texture | undefined;

    public constructor() {

        super();

        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        this.initUniforms();

    }

    private initUniforms(): void {

        this.setUniform('opacity', 1);

        this.setUniform('color', new Color());
        this.setUniform('map', undefined);
        this.setUniform('useMap', false);

        this.setUniform('roughness', 1);
        this.setUniform('roughnessMap', undefined);
        this.setUniform('useRoughnessMap', false);

        this.setUniform('metalness', 0);
        this.setUniform('metalnessMap', undefined);
        this.setUniform('useMetalnessMap', false);

        this.setUniform('modelViewMatrix', new Matrix4());
        this.setUniform('projectionMatrix', new Matrix4());
        this.setUniform('normalMatrix', new Matrix3());

    }

    public override onBeforRender(scene: Scene, mesh: Mesh, camera: Camera): void {

        let uniform: any;

        uniform = this.getUniform('opacity');
        uniform.value = this.opacity;

        uniform = this.getUniform('map');
        uniform.value = this.map;

        uniform = this.getUniform('useMap');
        uniform.value = !!this.map;

        uniform = this.getUniform('roughness');
        uniform.value = this.roughness;

        uniform = this.getUniform('roughnessMap');
        uniform.value = this.roughnessMap;

        uniform = this.getUniform('useRoughnessMap');
        uniform.value = !!this.roughnessMap;

        uniform = this.getUniform('metalness');
        uniform.value = this.metalness;

        uniform = this.getUniform('metalnessMap');
        uniform.value = this.metalnessMap;

        uniform = this.getUniform('useMetalnessMap');
        uniform.value = !!this.metalnessMap;

        uniform = this.getUniform('color');
        uniform.value.copy(this.color);

        uniform = this.getUniform('modelViewMatrix');
        uniform.value.copy(mesh.modelViewMatrix);

        uniform = this.getUniform('normalMatrix');
        uniform.value.copy(mesh.normalMatrix);

        uniform = this.getUniform('projectionMatrix');
        uniform.value.copy(camera.projectionMatrix);

    }

}
import { Color } from "../../structs/Color";
import { IUniform, Material } from "../Material";
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';
import { Texture } from "../../modules/Texture";
import { Mesh } from "../../objects/Mesh";
import { Camera } from "../../objects/Camera";
import { Matrix4 } from "../../structs/Matrix4";
import { Matrix3 } from "../../structs/Matrix3";
import { Scene } from "../../objects/Scene";
import { Vector3 } from "../../structs/Vector3";

type DirectionalLight = {

    color: Color;
    direction: Vector3;

}

type Uniforms = {

    opacity: IUniform<number>;
    color: IUniform<Color>;

    map: IUniform<Texture | undefined>;
    useMap: IUniform<boolean>;

    roughness: IUniform<number>;
    roughnessMap: IUniform<Texture | undefined>;
    useRoughnessMap: IUniform<boolean>;

    metalness: IUniform<number>;
    metalnessMap: IUniform<Texture | undefined>;
    useMetalnessMap: IUniform<boolean>;

    modelViewMatrix: IUniform<Matrix4>;
    normalMatrix: IUniform<Matrix3>;
    projectionMatrix: IUniform<Matrix4>;

    useNormal: IUniform<boolean>;
    useUV: IUniform<boolean>;
    useColor: IUniform<boolean>;

    ambientLightColor: IUniform<Color>;
    directionalLight: IUniform<DirectionalLight>;

}

export class PhysMaterial extends Material {

    declare public uniforms: Uniforms;

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

        this.setUniform('color', new Color());
        this.setUniform('opacity', 1);

        this.setUniform('map', undefined);
        this.setUniform('useMap', false);

        this.setUniform('roughness', 1);
        this.setUniform('roughnessMap', undefined);
        this.setUniform('useRoughnessMap', false);

        this.setUniform('metalness', 0);
        this.setUniform('metalnessMap', undefined);
        this.setUniform('useMetalnessMap', false);

        this.setUniform('modelViewMatrix', new Matrix4());
        this.setUniform('normalMatrix', new Matrix3());
        this.setUniform('projectionMatrix', new Matrix4());

        this.setUniform('useNormal', false);
        this.setUniform('useUV', false);
        this.setUniform('useColor', false);

        this.setUniform('ambientLightColor', new Color());

        this.setUniform('directionalLight', {
            color: new Color(),
            direction: new Vector3(),
        });

    }

    public override onBeforRender(scene: Scene, mesh: Mesh, camera: Camera): void {

        this.uniforms.opacity.value = this.opacity;
        this.uniforms.color.value.copy(this.color);

        this.uniforms.map.value = this.map;
        this.uniforms.useMap.value = !!this.map;

        this.uniforms.roughness.value = this.roughness;
        this.uniforms.roughnessMap.value = this.roughnessMap;
        this.uniforms.useRoughnessMap.value = !!this.roughnessMap;

        this.uniforms.metalness.value = this.metalness;
        this.uniforms.metalnessMap.value = this.metalnessMap;
        this.uniforms.useMetalnessMap.value = !!this.metalnessMap;

        this.uniforms.modelViewMatrix.value.copy(mesh.modelViewMatrix);
        this.uniforms.normalMatrix.value.copy(mesh.normalMatrix);
        this.uniforms.projectionMatrix.value.copy(camera.projectionMatrix);

        this.uniforms.useNormal.value = mesh.geometry.hasAttribute('normal');
        this.uniforms.useUV.value = mesh.geometry.hasAttribute('uv');
        this.uniforms.useColor.value = mesh.geometry.hasAttribute('color');

        this.uniforms.ambientLightColor.value.copy(scene.ambientLight.color);

        this.uniforms.directionalLight.value.color.copy(scene.directionalLight.color);
        this.uniforms.directionalLight.value.direction.copy(scene.directionalLight.direction);

    }

    public override dispose(): void {

        super.emit('dispose');

    }

}
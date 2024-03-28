import vertexShader from '../renderers/shaders/PhysicalMaterial.vert';
import fragmentShader from '../renderers/shaders/PhysicalMaterial.frag';
import { Color } from "../math/Color";
import { Matrix3 } from "../math/Matrix3";
import { Matrix4 } from "../math/Matrix4";
import { Vector3 } from "../math/Vector3";
import { Texture } from "../textures/Texture";
import { Material } from "./Material";
import { Scene } from '../objects/Scene';
import { Mesh } from '../objects/Mesh';
import { Camera } from '../cameras/Camera';

abstract class Helper {

    public static readonly matrix4 = new Matrix4();

}

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

    modelMatrix: IUniform<Matrix4>;
    viewMatrix: IUniform<Matrix4>;
    normalMatrix: IUniform<Matrix3>;
    projectionMatrix: IUniform<Matrix4>;

    useUV: IUniform<boolean>;

    ambientLightColor: IUniform<Color>;
    directionalLight: IUniform<DirectionalLight>;

    shadowMap: IUniform<Texture | undefined>;
    shadowMatrix: IUniform<Matrix4>;

}

export class PhysicalMaterial extends Material {

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

        this.uniforms = {

            color: { value: new Color(1, 1, 1) },
            opacity: { value: this.opacity },

            map: { value: this.map },
            useMap: { value: !!this.map },

            roughness: { value: this.roughness },
            roughnessMap: { value: this.roughnessMap },
            useRoughnessMap: { value: !!this.roughnessMap },

            metalness: { value: this.metalness },
            metalnessMap: { value: this.metalnessMap },
            useMetalnessMap: { value: !!this.metalnessMap },

            modelMatrix: { value: new Matrix4() },
            viewMatrix: { value: new Matrix4() },
            normalMatrix: { value: new Matrix3() },
            projectionMatrix: { value: new Matrix4() },

            useUV: { value: false },

            ambientLightColor: { value: new Color() },

            directionalLight: {

                value: {

                    color: new Color(),
                    direction: new Vector3(),
                }

            },

            shadowMap: { value: undefined },
            shadowMatrix: { value: new Matrix4() },

        }

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

        this.uniforms.modelMatrix.value.copy(mesh.worldMatrix);
        this.uniforms.viewMatrix.value.copy(camera.viewMatrix);
        this.uniforms.projectionMatrix.value.copy(camera.projectionMatrix);

        Helper.matrix4.multiplyMatrices(mesh.worldMatrix, camera.viewMatrix);
        this.uniforms.normalMatrix.value.makeNormalMatrix(Helper.matrix4);

        this.uniforms.useUV.value = mesh.geometry.hasAttribute('uv');

        this.uniforms.ambientLightColor.value.copy(scene.ambientLight.lightColor);

        this.uniforms.directionalLight.value.color.copy(scene.directionalLight.lightColor);
        this.uniforms.directionalLight.value.direction.copy(scene.directionalLight.lightDirection);

        this.uniforms.shadowMap.value = scene.directionalLight.shadow.texture;
        this.uniforms.shadowMatrix.value.copy(scene.directionalLight.shadow.matrix);


    }

}
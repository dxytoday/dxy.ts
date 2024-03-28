import { Constants } from "../Constants";
import { OrthographicCamera } from "../cameras/OrthographicCamera";
import { DepthMaterial } from "../materials/DepthMaterial";
import { Matrix4 } from "../math/Matrix4";
import { DataTexture } from "../textures/DataTexture";
import { DirectionalLight } from "./DirectionalLight";

abstract class Helper {

    public static readonly matrix4 = new Matrix4();

}

export class Shadow {

    public readonly size = 1024;

    public readonly camera = new OrthographicCamera();
    public readonly material = new DepthMaterial();

    public readonly texture = new DataTexture();
    public readonly matrix = new Matrix4();

    public updateShadowMatrix(light: DirectionalLight): void {

        const camera = this.camera;

        camera.position.copy(light.position);

        Helper.matrix4.makeLookAt(light.position, light.target);
        Helper.matrix4.extractRotation(camera.rotation);

        camera.updateMatrix();

        this.matrix.set(

            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.5, 0.5, 0.5, 1.0

        );

        Helper.matrix4.multiplyMatrices(camera.viewMatrix, camera.projectionMatrix);

        this.matrix.multiplyMatrices(Helper.matrix4, this.matrix);

    }

}
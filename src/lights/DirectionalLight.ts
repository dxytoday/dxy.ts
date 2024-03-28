import { Camera } from "../cameras/Camera";
import { Matrix3 } from "../math/Matrix3";
import { Vector3 } from "../math/Vector3";
import { Light } from "./Light";
import { Shadow } from "./Shadow";

abstract class Helper {

    public static readonly matrix3 = new Matrix3();

}

export class DirectionalLight extends Light {

    public readonly position = new Vector3(0, 1, 0);
    public readonly target = new Vector3(0, 0, 0);

    public readonly shadow = new Shadow();

    public readonly lightDirection = new Vector3();

    public override update(camera?: Camera): void {

        super.update();

        this.lightDirection.copy(this.position);
        this.lightDirection.sub(this.target);

        if (camera) {

            Helper.matrix3.setFromMatrix4(camera.viewMatrix);
            this.lightDirection.applyMatrix3(Helper.matrix3);

        }

    }

}

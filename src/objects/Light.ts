import { Color } from "../structs/Color";
import { Matrix3 } from "../structs/Matrix3";
import { Vector3 } from "../structs/Vector3";
import { Camera } from "./Camera";
import { TRSObject } from "./TRSObject";

class Instances {

    public static readonly m3 = new Matrix3();

}

export class Light extends TRSObject {

    public readonly lightColor = new Color(1, 1, 1);
    public lightIntensity = 1;

    public target = new Vector3(0, 0, 0);

    public readonly color = new Color(1, 1, 1);
    public readonly direction = new Vector3(0, 1, 0);

    public constructor() {

        super();
        this.name = 'light';

    }

    public update(camera: Camera): void {

        this.color.copy(this.lightColor);
        this.color.multiplyScalar(this.lightIntensity);

        this.direction.copy(this.position);
        this.direction.sub(this.target);

        Instances.m3.setFromMatrix4(camera.viewMatrix)
        this.direction.applyMatrix3(Instances.m3);

    }

}
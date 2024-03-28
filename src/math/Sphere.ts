import { Matrix4 } from "./Matrix4";
import { Vector3 } from "./Vector3";

abstract class Helper {

    public static readonly scale = new Vector3();

}

export class Sphere {

    public center = new Vector3(0, 0, 0);
    public radius = -1;

    public applyMatrix4(matrix: Matrix4): Sphere {

        this.center.applyMatrix4(matrix);

        matrix.extractScale(Helper.scale);

        const maxScale = Helper.scale.maxComponent();
        this.radius = this.radius * maxScale;

        return this;

    }

    public copy(sphere: Sphere): Sphere {

        this.center.copy(sphere.center);
        this.radius = sphere.radius;

        return this;

    }

}
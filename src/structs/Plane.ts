import { Vector3 } from "./Vector3";

export class Plane {

    public readonly normal = new Vector3(1, 0, 0);
    public constant = 0;

    public setComponents(x: number, y: number, z: number, w: number): Plane {

        this.normal.set(x, y, z);
        this.constant = w;

        return this;

    }

    public normalize(): Plane {

        const inverseNormalLength = 1.0 / this.normal.length();
        this.normal.multiplyScalar(inverseNormalLength);
        this.constant *= inverseNormalLength;

        return this;

    }

    public distanceToPoint(point: Vector3): number {

        return this.normal.dot(point) + this.constant;

    }

}
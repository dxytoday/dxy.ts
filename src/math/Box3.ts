import { Vector3 } from "./Vector3";

export class Box3 {

    public min = new Vector3(+Infinity, +Infinity, +Infinity);
    public max = new Vector3(-Infinity, -Infinity, -Infinity);

    public makeEmpty(): Box3 {

        this.min.x = this.min.y = this.min.z = + Infinity;
        this.max.x = this.max.y = this.max.z = - Infinity;

        return this;

    }

    public isEmpty(): boolean {

        return (this.max.x < this.min.x) || (this.max.y < this.min.y) || (this.max.z < this.min.z);

    }

    public getCenter(target: Vector3): Vector3 {

        return this.isEmpty() ? target.set(0, 0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);

    }

    public expandByPoint(point: Vector3): Box3 {

        this.min.min(point);
        this.max.max(point);

        return this;

    }

    public copy(box: Box3): Box3 {

        this.min.copy(box.min);
        this.max.copy(box.max);

        return this;

    }

}
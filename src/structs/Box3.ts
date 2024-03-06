import { Attribute } from "../modules/Attribute";
import { Vector3 } from "./Vector3";

export class Box3 {

    private static readonly vector3 = new Vector3();

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

    public setFromBufferAttribute(attribute: Attribute): Box3 {

        this.makeEmpty();

        for (let ii = 0, il = attribute.count; ii < il; ii++) {

            attribute.toVector3(ii, Box3.vector3);
            this.expandByPoint(Box3.vector3);

        }

        return this;

    }

    public copy(box: Box3): Box3 {

        this.min.copy(box.min);
        this.max.copy(box.max);

        return this;

    }

}
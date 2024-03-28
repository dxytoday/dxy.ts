import { Matrix4 } from "../math/Matrix4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";

export class TRSObject {

    public readonly position = new Vector3(0, 0, 0);
    public readonly rotation = new Quaternion(0, 0, 0, 1);
    public readonly scale = new Vector3(1, 1, 1);

    public readonly matrix = new Matrix4();
    public readonly worldMatrix = new Matrix4();

    public parent: TRSObject | undefined;
    public readonly children: TRSObject[] = [];

    public name = '';
    public visible = true;

    public updateMatrix(): void {

        this.matrix.compose(this.position, this.rotation, this.scale);
        this.worldMatrix.copy(this.matrix);

        if (this.parent) {

            this.worldMatrix.multiply(this.parent.worldMatrix);

        }

        for (const child of this.children) {

            child.updateMatrix();

        }

    }

    public add(object: TRSObject): TRSObject {

        if (object !== this) {

            if (object.parent) {

                object.parent.remove(object);

            }

            object.parent = this;
            this.children.push(object);

        }

        return this;

    }

    public remove(object: TRSObject): TRSObject {

        if (object !== this) {

            const index = this.children.indexOf(object);

            if (index !== -1) {

                object.parent = undefined;
                this.children.splice(index, 1);

            }

        }

        return this;

    }

}
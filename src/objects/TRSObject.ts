import { Matrix4 } from "../structs/Matrix4";
import { Quaternion } from "../structs/Quaternion";
import { Vector3 } from "../structs/Vector3";
import { EventObject } from "../modules/EventObject";

export class TRSObject extends EventObject {

    public name = ''

    public readonly position = new Vector3(0, 0, 0);
    public readonly rotation = new Quaternion(0, 0, 0, 1);
    public readonly scale = new Vector3(1, 1, 1);

    public readonly matrix = new Matrix4();
    public readonly worldMatrix = new Matrix4();

    public parent: TRSObject | undefined;
    public readonly children: TRSObject[] = [];

    public visible = true;

    public updateMatrix(): void {

        this.matrix.compose(this.position, this.rotation, this.scale);
        this.worldMatrix.copy(this.matrix);

        if (this.parent) {

            this.worldMatrix.multiply(this.parent.worldMatrix);

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

    public dispose(): void {

        this.emit('dispose');

    }

}
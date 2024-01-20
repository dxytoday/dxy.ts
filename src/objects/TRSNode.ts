import { Matrix4 } from "../structs/Matrix4";
import { Quaternion } from "../structs/Quaternion";
import { Vector3 } from "../structs/Vector3";
import { EventObject } from "../modules/EventObject";

export class TRSNode extends EventObject {

    public name = ''

    public readonly position = new Vector3(0, 0, 0);
    public readonly rotation = new Quaternion(0, 0, 0, 1);
    public readonly scale = new Vector3(1, 1, 1);

    public readonly localMatrix = new Matrix4();
    public readonly worldMatrix = new Matrix4();

    public parent: TRSNode | undefined;
    public readonly children: TRSNode[] = [];

    public visible = true;

    public updateMatrix(updateParents?: boolean, updateChildren?: boolean): void {

        if (updateParents && this.parent) {

            this.parent.updateMatrix(true, false);

        }

        this.localMatrix.compose(this.position, this.rotation, this.scale);
        this.worldMatrix.copy(this.localMatrix);

        if (this.parent) {

            this.worldMatrix.multiply(this.parent.worldMatrix);

        }

        if (updateChildren) {

            for (const child of this.children) {

                child.updateMatrix(false, true);

            }

        }

    }

    public add(node: TRSNode): TRSNode {

        if (node !== this) {

            if (node.parent) {

                node.parent.remove(node);

            }

            node.parent = this;
            this.children.push(node);

        }

        return this;

    }

    public remove(node: TRSNode): TRSNode {

        if (node !== this) {

            const index = this.children.indexOf(node);

            if (index !== -1) {

                node.parent = undefined;
                this.children.splice(index, 1);

            }

        }

        return this;

    }

}
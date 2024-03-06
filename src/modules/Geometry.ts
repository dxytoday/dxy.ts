import { Box3 } from "../structs/Box3";
import { Sphere } from "../structs/Sphere";
import { Vector3 } from "../structs/Vector3";
import { Attribute } from "./Attribute";
import { EventObject } from "./EventObject";

export type RenderGroup = {

    start: number;
    count: number;
    materialIndex: number;

}

class Helper {

    public static readonly vector3 = new Vector3();
    public static readonly box3 = new Box3();

    public static arrayNeedsUint32(array: number[]): boolean {

        for (let ii = array.length - 1; ii >= 0; --ii) {

            if (array[ii] >= 65535) {

                return true;

            }

        }

        return false;

    }

}

export class Geometry extends EventObject {

    public readonly attributes: { [key: string]: Attribute; } = {};
    public readonly boundingSphere = new Sphere();
    public readonly groups: RenderGroup[] = [];

    public indices: Attribute | undefined;

    public get position(): Attribute | undefined {

        return this.getAttribute('position');

    }

    public setIndices(array: number[]): void {

        if (Helper.arrayNeedsUint32(array)) {

            this.indices = new Attribute(new Uint32Array(array), 1);

        } else {

            this.indices = new Attribute(new Uint16Array(array), 1);

        }

    }

    public setAttribute(name: string, attribute: Attribute): Geometry {

        this.attributes[name] = attribute;
        return this;

    }

    public getAttribute(name: string): Attribute | undefined {

        return this.attributes[name];

    }

    public hasAttribute(name: string): boolean {

        return name in this.attributes;

    }

    public addGroup(start: number, count: number, materialIndex: number): Geometry {

        this.groups.push(

            {

                start: start,
                count: count,
                materialIndex: materialIndex

            }

        );

        return this;

    }

    public computeBoundingSphere(): void {

        if (!this.position) {

            return;

        }

        const center = this.boundingSphere.center;

        Helper.box3.setFromBufferAttribute(this.position);
        Helper.box3.getCenter(center);

        let maxRadiusSq = -1;

        for (let ii = 0, il = this.position.count; ii < il; ii++) {

            this.position.toVector3(ii, Helper.vector3);
            maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSq(Helper.vector3));

        }

        this.boundingSphere.radius = Math.sqrt(maxRadiusSq);

    }

    public dispose(): void {

        this.emit('dispose');

    }

}
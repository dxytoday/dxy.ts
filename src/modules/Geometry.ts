import { Attribute } from "./Attribute";
import { EventObject } from "./EventObject";

export type RenderGroup = {

    start: number;
    count: number;
    materialIndex: number;

}

class GeometryHelper {

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

    public readonly attributes = new Map<string, Attribute>();
    public readonly groups: RenderGroup[] = [];

    public indices: Attribute | undefined;

    public get position(): Attribute | undefined {

        return this.getAttribute('position');

    }

    public setIndices(array: number[]): void {

        if (GeometryHelper.arrayNeedsUint32(array)) {

            this.indices = new Attribute(new Uint32Array(array), 1);

        } else {

            this.indices = new Attribute(new Uint16Array(array), 1);

        }

    }

    public setAttribute(name: string, attribute: Attribute): Geometry {

        this.attributes.set(name, attribute);

        return this;

    }

    public getAttribute(name: string): Attribute | undefined {

        return this.attributes.get(name);

    }

    public hasAttribute(name: string): boolean {

        return this.attributes.has(name);

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

    public dispose(): void { }

}
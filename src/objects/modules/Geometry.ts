import { EventDispatcher } from "../../bases/EventDispatcher";
import { Attribute } from "./Attribute";

export class Geometry extends EventDispatcher {

	public static events = { dispose: 'dispose' };

	public attributes = new Map<string, Attribute>();
	public indices: Attribute;
	public groups: RenderGroup[] = [];

	public get position(): Attribute {

		return this.attributes.get('position');

	}

	public setIndices(array: number[]): void {

		if (this.arrayNeedsUint32(array) === true) {

			this.indices = new Attribute(new Uint32Array(array), 1);

		} else {

			this.indices = new Attribute(new Uint16Array(array), 1);

		}

	}

	private arrayNeedsUint32(array: number[]): boolean {

		for (let ii = array.length - 1; ii >= 0; --ii) {

			if (array[ii] >= 65535) {

				return true;

			}

		}

		return false;

	}

	public setAttribute(name: string, attribute: Attribute): void {

		this.attributes.set(name, attribute);

	}

	public getAttribute(name: string): Attribute {

		return this.attributes.get(name);

	}

	public deleteAttribute(name: string): void {

		this.attributes.delete(name);

	}

	public hasAttribute(name: string): boolean {

		return this.attributes.has(name);

	}

	public addGroup(start: number, count: number, materialIndex: number): void {

		this.groups.push(

			{

				start: start,
				count: count,
				materialIndex: materialIndex

			}

		);

	}

	public dispose(): void {

		this.dispatchEvent({ type: Geometry.events.dispose });

	}

}

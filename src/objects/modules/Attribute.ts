import { EventDispatcher } from "../../bases/EventDispatcher";
import { Util } from "../../bases/Util";

export class Attribute extends EventDispatcher {

	public static events = { dispose: 'dispose' };

	public usage = Util.STATIC_DRAW;
	public type: number;

	public changed = false;

	public constructor(

		public array: TypedArray,
		public itemSize: number,
		public normalized = false,
		public count = array.length / itemSize,

	) {

		super();

		this.type = Util.typedArrayMapping.get(this.array.constructor);

	}

	public getX(index: number): number {

		return this.array[index * this.itemSize];

	}

	public dispose(): void {

		this.dispatchEvent({ type: Attribute.events.dispose });

	}

}

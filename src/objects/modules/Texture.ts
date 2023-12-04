import { EventDispatcher } from "../../bases/EventDispatcher";
import { Util } from "../../bases/Util";

export class Texture extends EventDispatcher {

	public static events = { dispose: 'dispose' };

	public magFilter = Util.LINEAR;
	public minFilter = Util.LINEAR_MIPMAP_LINEAR;
	public wrapS = Util.REPEAT;
	public wrapT = Util.REPEAT;

	public flipY = false;
	public unpackAlignment = 4;
	public generateMipmap = true;

	public changed = false;

	public constructor(

		public image: ImageType

	) {

		super();

	}

	public dispose(): void {

		this.dispatchEvent({ type: Texture.events.dispose });

	}

}

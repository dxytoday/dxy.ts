import { WebGLConstants } from "../renderer/WebGLConstants";
import { EventObject } from "./EventObject";

export type TexImage = HTMLImageElement | ImageBitmap;

export class Texture extends EventObject {

    public magFilter = WebGLConstants.LINEAR;
    public minFilter = WebGLConstants.LINEAR_MIPMAP_LINEAR;
    public wrapS = WebGLConstants.REPEAT;
    public wrapT = WebGLConstants.REPEAT;

    public needsUpdate = false;

    public constructor(public image?: TexImage) {

        super();

    }

    public dispose(): void {

        this.emit('dispose');

    }

}

export class CubeTexture extends Texture {

    public constructor(public images?: TexImage[]) {

        super();

    }

}
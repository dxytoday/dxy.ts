import { Constants } from "../Constants";
import { Texture } from "./Texture";

export class DataTexture extends Texture {

    public constructor() {

        super();

        this.magFilter = Constants.NEAREST;
        this.minFilter = Constants.NEAREST;
        this.wrapS = Constants.CLAMP_TO_EDGE;
        this.wrapT = Constants.CLAMP_TO_EDGE;

    }

}
import { Constants } from "../Constants";

export abstract class Texture {

    public magFilter = Constants.LINEAR;
    public minFilter = Constants.LINEAR_MIPMAP_LINEAR;
    public wrapS = Constants.REPEAT;
    public wrapT = Constants.REPEAT;

    public needsUpdate = false;

}

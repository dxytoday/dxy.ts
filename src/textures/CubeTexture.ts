import { Texture } from "./Texture";

export class CubeTexture extends Texture {

    public constructor(

        public images?: TexImage[]

    ) {

        super();

    }

}
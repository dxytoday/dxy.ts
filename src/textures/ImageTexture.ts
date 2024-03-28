import { Texture } from "./Texture";

export class ImageTexture extends Texture {

    public constructor(

        public image?: TexImage

    ) {

        super();

    }

}
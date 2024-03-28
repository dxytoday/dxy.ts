import { CubeTexture } from "../textures/CubeTexture";
import { ImageTexture } from "../textures/ImageTexture";
import { ImageLoader } from "./ImageLoader";

abstract class Helper {

    public static readonly cubeSuffixes = ['/px.jpg', '/nx.jpg', '/py.jpg', '/ny.jpg', '/pz.jpg', '/nz.jpg'];

}

export class TextureLoader {

    public static async loadImageTexture(url: string): Promise<ImageTexture | undefined> {

        const image = await ImageLoader.load(url);

        if (image) {

            return new ImageTexture(image);

        }

    }

    public static async loadCubeTexture(url: string): Promise<CubeTexture | undefined> {

        const images: HTMLImageElement[] = [];

        for (const suffix of Helper.cubeSuffixes) {

            const image = await ImageLoader.load(url + suffix);

            if (!image) {

                return;

            }

            images.push(image);

        }

        return new CubeTexture(images);

    }

}
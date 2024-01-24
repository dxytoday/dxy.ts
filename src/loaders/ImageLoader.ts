export class ImageLoader {

    public static load(url: string, onLoad?: Function): Promise<HTMLImageElement> {

        return new Promise(

            function (resolve, reject) {

                const image = document.createElement('img');

                image.onload = () => {

                    onLoad && onLoad(image);
                    resolve(image);

                };

                image.onerror = () => {

                    onLoad && onLoad();
                    reject();

                };

                image.src = url;

            }

        );

    }

    public static loadArray(urls: string[], onLoad?: Function): Promise<HTMLImageElement[]> {

        return new Promise(

            async function (resolve, reject) {

                const images: HTMLImageElement[] = [];

                for (const url of urls) {

                    const image = await ImageLoader.load(url);

                    if (!image) {

                        onLoad && onLoad();
                        reject();

                    }

                    images.push(image);

                }

                onLoad && onLoad(images);
                resolve(images);

            }

        );

    }

}
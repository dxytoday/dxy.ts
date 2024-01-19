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

                    onLoad && onLoad(undefined);

                    reject();

                };

                image.src = url;

            }

        );

    }

}
export class ImageLoader {

    public static load(url: string): Promise<HTMLImageElement> {

        return new Promise(

            function (resolve, reject) {

                const image = document.createElement('img');

                image.onload = () => {

                    resolve(image);

                };

                image.onerror = () => {

                    reject();

                };

                image.src = url;

            }

        );

    }

}
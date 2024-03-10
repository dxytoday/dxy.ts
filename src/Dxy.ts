import { GLBLoader } from "./loaders/GLBLoader";
import { ImageLoader } from "./loaders/ImageLoader";
import { Camera } from "./cameras/Camera";
import { Scene } from "./objects/Scene";
import { TRSObject } from "./objects/TRSObject";
import { WebGL } from "./renderer/WebGL";

export default class Dxy {

	private readonly renderer: WebGL;
	private readonly scene: Scene;
	private readonly camera: Camera;

	public constructor(

		public readonly canvas = document.createElement('canvas')

	) {

		this.renderer = new WebGL(canvas);
		this.camera = new Camera(canvas);
		this.scene = new Scene();

		this.startAnimationFrame();

	}

	private startAnimationFrame(): void {

		let _elapsed = 0, _delta = 0;

		const frameCallback = (_time: number) => {

			requestAnimationFrame(frameCallback);

			_time /= 1000;
			_delta = _time - _elapsed;
			_elapsed = _time;

			this.resizing();
			this.animate(_delta);

		}

		requestAnimationFrame(frameCallback);

	}

	private resizing(): void {

		// if(this.canvas.width)

		// if (this.width !== this.canvas.clientWidth || this.height !== this.canvas.clientHeight) {

		// 	this.width = this.canvas.clientWidth;
		// 	this.height = this.canvas.clientHeight;

		// 	this.canvas.width = this.width;
		// 	this.canvas.height = this.height;

		// 	this.camera.aspect = this.width / this.height;
		// 	this.camera.updateProjectionMatrix();

		// 	this.renderer.state.setViewport(0, 0, this.width, this.height);

		// }

		

	}

	private animate(delta: number): void {

		this.renderer.render(this.scene, this.camera);

	}

	public loadModel(parameters: any = {}): void {

		const type: string = parameters.type || 'glb';
		const url: string = parameters.url;

		switch (type) {

			case 'glb':

				GLBLoader.load(url, (object: TRSObject) => {

					if (object) {

						this.scene.add(object);

					}

				});

				break;

			case 'fbx':



				break;

		}

	}

	public setBackground(parameters: any = {}): void {

		const type: string = parameters.type;
		const color: string = parameters.color;
		const image: string = parameters.image;
		const skybox: string = parameters.skybox;

		switch (type) {

			case 'color':

				this.scene.setBackgroundColor(color);

				break;

			case 'image':

				ImageLoader.load(image, (image: HTMLImageElement) => {

					this.scene.setBackgroundImage(image);

				});

				break;

			case 'skybox':

				ImageLoader.loadArray(
					[
						`${skybox}/px.jpg`, `${skybox}/nx.jpg`,
						`${skybox}/py.jpg`, `${skybox}/ny.jpg`,
						`${skybox}/pz.jpg`, `${skybox}/nz.jpg`,
					],
					(images: HTMLImageElement[]) => {

						this.scene.setBackgroundCube(images);

					}
				);

				break;

		}

	}

}

import { GLBLoader } from "./loaders/GLBLoader";
import { ImageLoader } from "./loaders/ImageLoader";
import { Texture } from "./modules/Texture";
import { Camera } from "./objects/Camera";
import { Scene } from "./objects/Scene";
import { TRSNode } from "./objects/TRSNode";
import { WebGL } from "./renderer/WebGL";
import { Color } from "./structs/Color";

export default class Dxy {

	private frameHandle: number = -1;

	private width = -1;
	private height = -1;

	private readonly renderer: WebGL;

	private readonly scene: Scene;
	private readonly camera: Camera;

	public constructor(public readonly canvas = document.createElement('canvas')) {

		this.renderer = new WebGL(canvas);
		this.camera = new Camera(canvas);
		this.scene = new Scene();

		this.startAnimationFrame();

	}

	private startAnimationFrame(): void {

		if (this.frameHandle !== -1) {

			return;

		}

		const scope = this;
		let _elapsed = 0, _delta = 0;

		function frameCallback(time: number): void {

			scope.frameHandle = requestAnimationFrame(frameCallback);

			time /= 1000;
			_delta = time - _elapsed;
			_elapsed = time;

			scope.animate(_delta);

		}

		this.frameHandle = requestAnimationFrame(frameCallback);

	}

	private animate(delta: number): void {

		if (this.width !== this.canvas.clientWidth || this.height !== this.canvas.clientHeight) {

			this.width = this.canvas.clientWidth;
			this.height = this.canvas.clientHeight;

			this.canvas.width = this.width;
			this.canvas.height = this.height;

			this.camera.aspect = this.width / this.height;
			this.camera.updateProjectionMatrix();

			this.renderer.state.setViewport(0, 0, this.width, this.height);

		}

		this.renderer.render(this.scene, this.camera);

	}

	public destroy() {

		cancelAnimationFrame(this.frameHandle);
		this.frameHandle = -1;

	}

	public loadGLB(url: string, onLoad: Function): void {

		GLBLoader.load(url, (object: TRSNode) => {

			this.scene.add(object);

			onLoad && onLoad(true);

		});

	}

	public setBackground(value: string, type = ''): void {

		switch (type) {

			case '':

				this.scene.setBackgroundColor(value);
				break;

			case 'image':

				ImageLoader.load(value, (image: HTMLImageElement) => this.scene.setBackgroundImage(image));
				break;

			case 'skybox':
				break;

		}

	}

}

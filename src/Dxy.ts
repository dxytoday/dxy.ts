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

	public loadModel(parameters: any = {}): void {

		const type: string = parameters.type || 'glb';
		const url: string = parameters.url;
		const onLoad: Function = parameters.onLoad;

		if (!url) {

			onLoad && onLoad(false);
			return;

		}

		if (type === 'glb') {

			GLBLoader.load(url, (object: TRSNode) => {

				this.scene.add(object);
				onLoad && onLoad(true);

			});

			return;

		}

		if (type === 'fbx') {

		}

	}

	public setBackground(parameters: any = {}): void {

		const type: string = parameters.type;

		if (type === 'color') {

			this.scene.setBackgroundColor(parameters.color);

			return;

		}

		if (type === 'image') {

			ImageLoader.load(parameters.url, (image: HTMLImageElement) => {

				this.scene.setBackgroundImage(image);

			});

			return;

		}

		if (type === 'skybox') {



		}

	}

}

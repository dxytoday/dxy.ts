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

	private readonly renderer: WebGL;

	private readonly scene: Scene;
	private readonly camera: Camera;

	public constructor(public readonly canvas = document.createElement('canvas')) {

		this.renderer = new WebGL(canvas);

		this.scene = new Scene();
		this.camera = new Camera();

		this.startAnimationFrame();

	}

	private startAnimationFrame(): void {

		if (this.frameHandle !== -1) {

			return;

		}

		const scope = this;

		let _elapsed = 0, _delta = 0;
		let _width = -1, _height = -1;

		function frameCallback(time: number): void {

			scope.frameHandle = requestAnimationFrame(frameCallback);

			time /= 1000;
			_delta = time - _elapsed;
			_elapsed = time;

			if (_width !== scope.canvas.clientWidth || _height !== scope.canvas.clientHeight) {

				_width = scope.canvas.clientWidth;
				_height = scope.canvas.clientHeight;

				scope.canvas.width = _width;
				scope.canvas.height = _height;

				scope.camera.aspect = _width / _height;
				scope.camera.updateProjectionMatrix();

				scope.renderer.state.setViewport(0, 0, _width, _height);

			}

			scope.onRenderBefor(_delta);
			scope.renderer.render(scope.scene, scope.camera);

		}

		this.frameHandle = requestAnimationFrame(frameCallback);

	}

	public destroy() {

		cancelAnimationFrame(this.frameHandle);
		this.frameHandle = -1;

	}

	public onRenderBefor(delta: number): void { }

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

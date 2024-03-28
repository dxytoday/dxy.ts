import { GLBLoader } from "./loaders/GLBLoader";
import { Scene } from "./objects/Scene";
import { TRSObject } from "./modules/TRSObject";
import { WebGLRenderer } from "./renderers/WebGLRenderer";
import { OrbitControls } from "./controls/OrbitControls";
import { PerspectiveCamera } from "./cameras/PerspectiveCamera";
import { TextureLoader } from "./loaders/TextureLoader";

export default class Dxy {

	private readonly renderer: WebGLRenderer;
	private readonly scene: Scene;

	private readonly camera: PerspectiveCamera;
	private readonly orbitControls: OrbitControls;

	public constructor(

		public readonly canvas = document.createElement('canvas')

	) {

		this.renderer = new WebGLRenderer(canvas);
		this.scene = new Scene();

		this.camera = new PerspectiveCamera();
		this.orbitControls = new OrbitControls(canvas, this.camera);

		this.resizing(true);

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

	private resizing(force?: boolean): void {

		if (

			!force &&
			this.canvas.width === this.canvas.clientWidth &&
			this.canvas.height === this.canvas.clientHeight

		) {

			return;

		}

		const width = this.canvas.clientWidth;
		const height = this.canvas.clientHeight

		this.canvas.width = width;
		this.canvas.height = height;

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(width, height);

	}

	private animate(delta: number): void {

		// 临时
		if (this.scene.children[0]) {

			const y = this.scene.children[0].rotation.eulerY + Math.PI * delta * 0.25;
			this.scene.children[0].rotation.eulerY = y % (Math.PI * 2);

		}

		this.orbitControls.update(delta);

		this.renderer.render(this.scene, this.camera);

	}

	public async loadModel(parameters: any = {}): Promise<boolean> {

		let result = false;

		const type: string = parameters.type || 'glb';
		const url: string = parameters.url;

		switch (type) {

			case 'glb':

				const object = await GLBLoader.load(url);

				if (object) {

					this.scene.add(object);
					result = true;

				}

				break;

			case 'fbx':

				// 暂时不需要

				break;

		}

		return result;

	}

	public async setBackground(parameters: any = {}): Promise<void> {

		const type: string = parameters.type;
		const color: string = parameters.color;
		const image: string = parameters.image;
		const skybox: string = parameters.skybox;

		switch (type) {

			case 'color':

				this.scene.setBackgroundColor(color);

				break;

			case 'image':

				const imageTexture = await TextureLoader.loadImageTexture(image);

				if (imageTexture) {

					this.scene.setBackgroundImage(imageTexture);

				}

				break;

			case 'skybox':

				const cubeTexture = await TextureLoader.loadCubeTexture(skybox);

				if (cubeTexture) {

					this.scene.setBackgroundCube(cubeTexture);

				}

				break;

		}

	}

}

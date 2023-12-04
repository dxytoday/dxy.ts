import { CanvasElement } from "./bases/CanvasElement";
import { TRSNode } from "./objects/TRSNode";
import { Camera } from "./objects/camera/Camera";
import { CameraControls } from "./objects/camera/CameraControls";
import { AmbientLight } from "./objects/lights/AmbientLight";
import { SpotLight } from "./objects/lights/SpotLight";
import { WebGL } from "./webgl/WebGL";

export class Context {

	public element: CanvasElement;

	public scene: TRSNode;
	public camera: Camera;
	public cameraControls: CameraControls;
	public ambientLight: AmbientLight;
	public spotLight: SpotLight;

	public renderer: WebGL

	public destroyed = false;

	public constructor(public canvas: HTMLCanvasElement) {

		this.element = new CanvasElement(this.canvas);

		this.camera = new Camera(this.element);
		this.cameraControls = new CameraControls(this.camera, this.element);
		this.ambientLight = new AmbientLight();
		this.spotLight = new SpotLight(this.camera);
		this.scene = new TRSNode();

		this.renderer = new WebGL(

			this.element,
			this.camera,
			this.ambientLight,
			this.spotLight,
			this.scene

		);

		this.startAnimationFrame();

	}

	private startAnimationFrame(): void {

		const scope = this;
		let preElapsed = 0, delta = 0;

		function frameCallback(elapsed: number): void {

			delta = elapsed - preElapsed;
			preElapsed = elapsed;

			scope.animate(delta);

			if (scope.destroyed) {

				return;

			}

			requestAnimationFrame(frameCallback);

		}

		requestAnimationFrame(frameCallback);

	}

	private animate(delta: number): void {

		this.element.update();
		this.cameraControls.update();

		// todo: 执行补间动画

		this.renderer.render();

	}

}
import { EventDispatcher } from "./EventDispatcher";

export class CanvasElement extends EventDispatcher {

	public static events = {

		pointerDown: 'pointerdown',
		pointerMove: 'pointermove',
		pointerUp: 'pointerup',
		wheel: 'wheel',
		resize: 'resize',

	};

	private resizeEvent = { type: CanvasElement.events.resize };

	public dispose: () => void;

	public constructor(

		public canvas: HTMLCanvasElement

	) {

		super();

		const scope = this;

		const pointerDown = { type: CanvasElement.events.pointerDown, event: undefined };
		const pointerMove = { type: CanvasElement.events.pointerMove, event: undefined };
		const pointerUp = { type: CanvasElement.events.pointerUp, event: undefined };
		const wheel = { type: CanvasElement.events.wheel, event: undefined };

		function onContextMenu(event: Event) {

			event.preventDefault();

		}

		function onPointerDown(event: PointerEvent) {

			canvas.setPointerCapture(event.pointerId);

			pointerDown.event = event;
			scope.dispatchEvent(pointerDown);

		}

		function onPointerMove(event: Event) {

			pointerMove.event = event;
			scope.dispatchEvent(pointerMove);

		}

		function onPointerUp(event: PointerEvent) {

			canvas.releasePointerCapture(event.pointerId);

			pointerUp.event = event;
			scope.dispatchEvent(pointerUp);

		}

		function onWheel(event: Event) {

			event.preventDefault();

			wheel.event = event;
			scope.dispatchEvent(wheel);

		}

		canvas.addEventListener('contextmenu', onContextMenu);

		canvas.addEventListener('pointerdown', onPointerDown);
		canvas.addEventListener('pointermove', onPointerMove);

		canvas.addEventListener('pointerup', onPointerUp);
		canvas.addEventListener('pointercancel', onPointerUp);

		canvas.addEventListener('wheel', onWheel, { passive: false });

		this.dispose = function (): void {

			canvas.removeEventListener('contextmenu', onContextMenu);
			canvas.removeEventListener('pointerdown', onPointerDown);
			canvas.removeEventListener('pointermove', onPointerMove);
			canvas.removeEventListener('pointerup', onPointerUp);
			canvas.removeEventListener('pointercancel', onPointerUp);
			canvas.removeEventListener('wheel', onWheel);

		}

	}

	public get width(): number {

		return this.canvas.clientWidth;

	}

	public get height(): number {

		return this.canvas.clientHeight;

	}

	public update(): void {

		if (

			this.canvas.clientWidth === this.canvas.width &&
			this.canvas.clientHeight === this.canvas.height

		) {

			return;

		}

		this.canvas.width = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;

		this.dispatchEvent(this.resizeEvent);

	}

	public getWebGLContext(): WebGL2RenderingContext {

		const contextAttributes = {

			alpha: true,
			depth: true,
			stencil: true,
			antialias: true,
			premultipliedAlpha: true,
			preserveDrawingBuffer: true,
			powerPreference: "default",
			failIfMajorPerformanceCaveat: true,

		};

		let context = this.canvas.getContext("webgl2", contextAttributes);

		if (context !== null) {

			return context as WebGL2RenderingContext;

		}

		throw new Error('Dxy.CanvasElement.getWebGLContext : 当前环境不支持 webgl2 .');

	}

}

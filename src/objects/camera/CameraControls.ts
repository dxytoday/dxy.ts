import { CanvasElement } from "../../bases/CanvasElement";
import { Matrix4 } from "../../struct/Matrix4";
import { Spherical } from "../../struct/Spherical";
import { Vector2 } from "../../struct/Vector2";
import { Vector3 } from "../../struct/Vector3";
import { Camera } from "./Camera";

const _m4 = /*@__PURE__*/ new Matrix4();
const _v3 = /*@__PURE__*/ new Vector3();
const _circle = /*@__PURE__*/ Math.PI * 2;

export class CameraControls {

	public enable = true;
	public type = 'free'; // free follow fly

	public readonly viewPoint = new Vector3();

	private state = 'none'; // pan zoom rotate none

	private readonly rotateStart = new Vector2();
	private readonly rotateEnd = new Vector2();
	private readonly rotateDelta = new Vector2();

	private readonly panStart = new Vector2();
	private readonly panEnd = new Vector2();
	private readonly panOffset = new Vector3();

	private zoom = 1;

	private readonly offset = new Vector3();
	private readonly spherical = new Spherical();

	public constructor(

		private camera: Camera,
		private element: CanvasElement,

	) {

		this.element.addEventListener(CanvasElement.events.pointerDown, this.onPointerDown, this);
		this.element.addEventListener(CanvasElement.events.pointerMove, this.onPointerMove, this);
		this.element.addEventListener(CanvasElement.events.pointerUp, this.onPointerUp, this);
		this.element.addEventListener(CanvasElement.events.wheel, this.onMouseWheel, this);

	}

	private onPointerDown(anyEvent: AnyEvent): void {

		const event = anyEvent.event as PointerEvent;

		if (event.button === 0) {

			// left

			this.state = 'rotate';
			this.rotateStart.set(event.clientX, event.clientY);

		} else if (event.button === 1) {

			// middle

		} else if (event.button === 2) {

			// right

			this.state = 'pan';
			this.panStart.set(event.clientX, event.clientY);

		}

	}

	private onPointerMove(anyEvent: AnyEvent): void {

		const event = anyEvent.event as PointerEvent;

		if (this.state === 'rotate') {

			this.rotateEnd.set(event.clientX, event.clientY);
			this.rotateStart.subVectors(this.rotateEnd, this.rotateStart);

			const theta = this.rotateStart.x / this.element.height * _circle;
			const phi = this.rotateStart.y / this.element.height * _circle;

			this.rotateDelta.x -= theta;
			this.rotateDelta.y -= phi;

			this.rotateStart.copy(this.rotateEnd);

		} else if (this.state === 'pan') {

			this.panEnd.set(event.clientX, event.clientY);
			this.panStart.subVectors(this.panEnd, this.panStart);

			const fov = this.camera.fov / 180 * Math.PI;
			let dis = this.camera.translation.distanceTo(this.viewPoint);
			dis *= Math.tan(fov * 0.5);

			_m4.copy(this.camera.viewMatrix).invert();

			const xOffset = this.panStart.x / this.element.height * dis;
			_v3.setFromMatrixColumn(_m4, 0);
			_v3.multiplyScalar(-xOffset);
			this.panOffset.add(_v3);

			const yOffset = this.panStart.y / this.element.height * dis;
			_v3.setFromMatrixColumn(_m4, 1);
			_v3.multiplyScalar(yOffset);
			this.panOffset.add(_v3);

			this.panStart.copy(this.panEnd);

		}

	}

	private onPointerUp(): void {

		this.state = 'none';

	}

	private onMouseWheel(anyEvent: AnyEvent): void {

		const event = anyEvent.event as WheelEvent;

		if (event.deltaY < 0) {

			this.zoom *= 0.95;

		}

		if (event.deltaY > 0) {

			this.zoom /= 0.95;

		}

	}

	public update(): void {

		if (

			this.rotateDelta.isZero() &&
			this.panOffset.isZero() &&
			this.zoom === 1

		) {

			return;

		}

		this.offset.copy(this.camera.translation).sub(this.viewPoint);

		this.spherical.setFromVector3(this.offset);

		this.spherical.theta += this.rotateDelta.x;
		this.spherical.phi += this.rotateDelta.y;

		this.spherical.makeSafe();

		this.spherical.radius *= this.zoom;

		this.offset.setFromSpherical(this.spherical);

		this.viewPoint.add(this.panOffset);

		this.camera.translation.copy(this.viewPoint).add(this.offset);
		this.camera.lookAt(this.viewPoint);
		this.camera.updateViewMatrix();

		this.rotateDelta.set(0, 0);
		this.panOffset.set(0, 0, 0);
		this.zoom = 1;

	}

}
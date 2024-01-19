import { Matrix4 } from "../structs/Matrix4";
import { Vector2 } from "../structs/Vector2";
import { Vector3 } from "../structs/Vector3";
import { TRSNode } from "./TRSNode";

class Controls {

    public readonly dispose: () => void;

    private state = 'none'; // pan zoom rotate none

    public readonly viewPoint = new Vector3();

    private readonly rotateStart = new Vector2();
    private readonly rotateEnd = new Vector2();
    private readonly rotateDelta = new Vector2();

    private readonly panStart = new Vector2();
    private readonly panEnd = new Vector2();
    private readonly panOffset = new Vector3();

    private zoom = 1;

    public constructor(

        private readonly camera: Camera,
        private readonly canvas: HTMLCanvasElement,

    ) {

        const onContextMenu = this.onContextMenu.bind(this);
        const onPointerDown = this.onPointerDown.bind(this);
        const onPointerMove = this.onPointerMove.bind(this);
        const onPointerUp = this.onPointerUp.bind(this);
        const onMouseWheel = this.onMouseWheel.bind(this);

        canvas.addEventListener('contextmenu', onContextMenu);
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointercancel', onPointerUp);
        canvas.addEventListener('wheel', onMouseWheel, { passive: false });

        this.dispose = function (): void {

            canvas.removeEventListener('contextmenu', onContextMenu);
            canvas.removeEventListener('pointerdown', onPointerDown);
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('pointerup', onPointerUp);
            canvas.removeEventListener('pointercancel', onPointerUp);
            canvas.removeEventListener('wheel', onMouseWheel);

        }

    }

    public update(): void {



    }

    private onContextMenu(event: Event): void {

        event.preventDefault();

    }

    private onPointerDown(event: PointerEvent): void {

        this.canvas.setPointerCapture(event.pointerId);

        if (event.button === 0) { // left

            this.state = 'rotate';
            this.rotateStart.set(event.clientX, event.clientY);

        } else if (event.button === 2) { // right

            this.state = 'pan';
            this.panStart.set(event.clientX, event.clientY);

        }

    }

    private onPointerMove(event: PointerEvent): void {

        if (this.state === 'rotate') {

            this.rotateEnd.set(event.clientX, event.clientY);

            this.rotateStart.sub(this.rotateEnd, this.rotateStart);
            this.rotateStart.multiply(2 * Math.PI / this.canvas.height);
            this.rotateDelta.sub(this.rotateStart);

            this.rotateStart.set(this.rotateEnd);

        } else if (this.state === 'pan') {

            this.panEnd.set(event.clientX, event.clientY);

            this.panStart.sub(this.panEnd, this.panStart);

            const fov = this.camera.fov / 180 * Math.PI;
            // let dis = this.camera.position.distanceTo(this.viewPoint);
            // dis *= Math.tan(fov * 0.5);

            // _m4.copy(this.camera.viewMatrix).invert();

            // const xOffset = this.panStart.x / this.element.height * dis;
            // _v3.setFromMatrixColumn(_m4, 0);
            // _v3.multiplyScalar(-xOffset);
            // this.panOffset.add(_v3);

            // const yOffset = this.panStart.y / this.element.height * dis;
            // _v3.setFromMatrixColumn(_m4, 1);
            // _v3.multiplyScalar(yOffset);
            // this.panOffset.add(_v3);

            // this.panStart.copy(this.panEnd);

        }

    }

    private onPointerUp(event: PointerEvent): void {

        this.canvas.releasePointerCapture(event.pointerId);
        this.state = 'none';

    }

    private onMouseWheel(event: WheelEvent): void {

        event.preventDefault();

        if (event.deltaY < 0) {

            this.zoom *= 0.95;

        }

        if (event.deltaY > 0) {

            this.zoom /= 0.95;

        }

    }

}

export class Camera extends TRSNode {

    public readonly controls: Controls;

    public readonly viewMatrix = new Matrix4();
    public readonly projectionMatrix = new Matrix4();

    public fov = 50;
    public aspect = 1;
    public near = 0.001;
    public far = 2000;

    public constructor(canvas: HTMLCanvasElement) {

        super();
        this.name = 'camera';

        this.controls = new Controls(this, canvas);

    }

    public override updateMatrix(updateParents?: boolean, updateChildren?: boolean): void {

        this.controls.update();

        super.updateMatrix(updateParents, updateChildren);
        this.viewMatrix.set(this.worldMatrix).invert();

    }

    public updateProjectionMatrix(): void {

        const near = this.near;
        const far = this.far;

        const fov = this.fov / 180 * Math.PI;

        // 计算 near 范围的 top bottom right left

        const top = near * Math.tan(fov * 0.5);
        const bottom = -top;
        const right = top * this.aspect;
        const left = -right;

        this.projectionMatrix.makePerspective(left, right, top, bottom, near, far);

    }

    public dispose(): void {

        this.controls.dispose();

    }

}
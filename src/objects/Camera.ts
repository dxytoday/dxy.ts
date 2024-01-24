import { Matrix3 } from "../structs/Matrix3";
import { Matrix4 } from "../structs/Matrix4";
import { Spherical } from "../structs/Spherical";
import { Vector2 } from "../structs/Vector2";
import { Vector3 } from "../structs/Vector3";
import { TRSObject } from "./TRSObject";

class Instances {

    public static readonly v3 = new Vector3();
    public static readonly m3 = new Matrix3();
    public static readonly m4 = new Matrix4();
    public static readonly sph = new Spherical();

}

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

        if (

            this.rotateDelta.equalsScalar(0) &&
            this.panOffset.equalsScalar(0) &&
            this.zoom === 1

        ) {

            return;

        }

        Instances.v3.subVectors(this.camera.position, this.viewPoint);
        Instances.sph.setFromVector3(Instances.v3);

        // 因为是控制相机旋转，为了让物体旋转方向和鼠标移动方向一致所以用减号
        Instances.sph.theta -= this.rotateDelta.x;
        Instances.sph.phi -= this.rotateDelta.y;
        Instances.sph.makeSafe();

        Instances.sph.radius *= this.zoom;
        Instances.sph.toVector3(Instances.v3);

        this.camera.position.copy(this.viewPoint);
        this.camera.position.add(Instances.v3);

        this.viewPoint.sub(this.panOffset);

        this.camera.lookAt(this.viewPoint);

        this.rotateDelta.setScalar(0);
        this.panOffset.setScalar(0);
        this.zoom = 1;

    }

    private onContextMenu(event: Event): void {

        event.preventDefault();

    }

    private onPointerDown(event: PointerEvent): void {

        this.canvas.setPointerCapture(event.pointerId);

        if (event.button === 0) {

            this.state = 'rotate';
            this.rotateStart.set(event.clientX, event.clientY);

        } else if (event.button === 2) {

            this.state = 'pan';
            this.panStart.set(event.clientX, event.clientY);

        }

    }

    private onPointerMove(event: PointerEvent): void {

        if (this.state === 'rotate') {

            this.rotateEnd.set(event.clientX, event.clientY);
            this.rotateStart.subVectors(this.rotateEnd, this.rotateStart);

            // 以 [画布高度 = 2PI] 为基准，计算 xy 移动的等比例弧度
            this.rotateStart.multiplyScalar(2 * Math.PI / this.canvas.height);

            // 累计计算结果
            this.rotateDelta.add(this.rotateStart);

            this.rotateStart.copy(this.rotateEnd);

            return;

        }

        if (this.state === 'pan') {

            this.panEnd.set(event.clientX, event.clientY);
            this.panStart.subVectors(this.panEnd, this.panStart);

            // 计算以 fov 为夹角的中心到顶部的距离
            const halfFov = this.camera.fov / 360 * Math.PI;
            let edge = this.camera.position.distanceTo(this.viewPoint);
            edge *= Math.tan(halfFov);

            // 以 [画布高度 = fov 垂直距离] 为基准，计算 xy 移动的等比例距离
            this.panStart.multiplyScalar(2 * edge / this.canvas.height);

            // 从相机空间转换到世界空间，-y 是因为像素 ↓ 为正 webgl ↑ 为正
            Instances.v3.set(this.panStart.x, -this.panStart.y, 0);
            Instances.m3.setFromMatrix4(this.camera.worldMatrix);
            Instances.v3.applyMatrix3(Instances.m3);

            // 累计计算结果
            this.panOffset.add(Instances.v3);

            this.panStart.copy(this.panEnd);

            return;

        }

    }

    private onPointerUp(event: PointerEvent): void {

        this.canvas.releasePointerCapture(event.pointerId);
        this.state = 'none';

    }

    private onMouseWheel(event: WheelEvent): void {

        event.preventDefault();

        if (event.deltaY < 0) {

            this.zoom *= 0.9;

        }

        if (event.deltaY > 0) {

            this.zoom /= 0.9;

        }

    }

}

export class Camera extends TRSObject {

    public readonly controls: Controls;

    public readonly viewMatrix = new Matrix4();
    public readonly projectionMatrix = new Matrix4();

    public fov = 50;
    public aspect = 1;
    public near = 1;
    public far = 2000;

    public constructor(canvas: HTMLCanvasElement) {

        super();
        this.name = 'camera';

        this.controls = new Controls(this, canvas);

    }

    public override updateMatrix(updateParents?: boolean, updateChildren?: boolean): void {

        this.controls.update();

        super.updateMatrix(updateParents, updateChildren);
        this.viewMatrix.copy(this.worldMatrix).invert();

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

    public lookAt(target: Vector3): void {

        Instances.m4.makeLookAt(this.position, target);
        this.rotation.setFromMatrix4(Instances.m4);

    }

}
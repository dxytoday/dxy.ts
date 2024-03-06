import { Frustum } from "../structs/Frustum";
import { Matrix3 } from "../structs/Matrix3";
import { Matrix4 } from "../structs/Matrix4";
import { Quaternion } from "../structs/Quaternion";
import { Sphere } from "../structs/Sphere";
import { Spherical } from "../structs/Spherical";
import { Vector2 } from "../structs/Vector2";
import { Vector3 } from "../structs/Vector3";
import { Mesh } from "./Mesh";
import { TRSObject } from "./TRSObject";

class Controls {

    private static readonly offset = new Vector3();
    private static readonly spherical = new Spherical();
    private static readonly matrix4 = new Matrix4();

    private static readonly pixelDelta = new Vector2();
    private static readonly panDelta = new Vector3();
    private static readonly matrix3 = new Matrix3();

    public readonly dispose: () => void;

    private state = 'none'; // pan zoom rotate none

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

    private get position(): Vector3 {

        return this.camera.position;

    }

    private get rotation(): Quaternion {

        return this.camera.rotation;

    }

    private get viewPoint(): Vector3 {

        return this.camera.viewPoint

    }

    public update(): void {

        Controls.offset.subVectors(this.position, this.viewPoint);
        Controls.spherical.setFromVector3(Controls.offset);

        // 减号目的在于让物体变换的方向和鼠标移动方向一致
        Controls.spherical.theta -= this.rotateDelta.x;
        Controls.spherical.phi -= this.rotateDelta.y;
        Controls.spherical.makeSafe();

        Controls.spherical.radius *= this.zoom;
        Controls.spherical.toVector3(Controls.offset);

        this.viewPoint.sub(this.panOffset);

        this.position.copy(this.viewPoint);
        this.position.add(Controls.offset);

        this.panOffset.setScalar(0);
        this.rotateDelta.setScalar(0);
        this.zoom = 1;

        Controls.matrix4.makeLookAt(this.position, this.viewPoint);
        Controls.matrix4.extractRotation(this.rotation);

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
            Controls.pixelDelta.subVectors(this.panEnd, this.panStart);

            // 计算以 fov 为夹角的中心到顶部的距离
            const halfFov = this.camera.fov / 360 * Math.PI;
            let edge = this.position.distanceTo(this.viewPoint);
            edge *= Math.tan(halfFov);

            // 以 [画布高度 = fov 垂直距离] 为基准，计算 xy 移动的等比例距离
            Controls.pixelDelta.multiplyScalar(2 * edge / this.canvas.height);

            // 从相机空间转换到世界空间，-y 是因为像素 ↓ 为正 webgl ↑ 为正
            Controls.panDelta.set(Controls.pixelDelta.x, -Controls.pixelDelta.y, 0);
            Controls.matrix3.setFromMatrix4(this.camera.worldMatrix);
            Controls.panDelta.applyMatrix3(Controls.matrix3);

            this.panOffset.add(Controls.panDelta);
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

    private static readonly matrix4 = new Matrix4();
    private static readonly sphere = new Sphere();

    private readonly frustum = new Frustum();

    public viewPoint = new Vector3();

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

    public override updateMatrix(): void {

        this.controls.update();

        super.updateMatrix();
        this.viewMatrix.copy(this.worldMatrix).invert();

        Camera.matrix4.multiplyMatrices(this.viewMatrix, this.projectionMatrix);
        this.frustum.setFromProjectionMatrix(Camera.matrix4);

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

    public frustumCulling(mesh: Mesh): boolean {

        Camera.sphere.copy(mesh.geometry.boundingSphere as Sphere);
        Camera.sphere.applyMatrix4(mesh.worldMatrix);

        return this.frustum.intersectsSphere(Camera.sphere);

    }

}
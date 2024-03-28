import { Camera } from "../cameras/Camera";
import { OrthographicCamera } from "../cameras/OrthographicCamera";
import { PerspectiveCamera } from "../cameras/PerspectiveCamera";
import { Matrix3 } from "../math/Matrix3";
import { Matrix4 } from "../math/Matrix4";
import { Spherical } from "../math/Spherical";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";

abstract class Helper {

    public static readonly offset = new Vector3();
    public static readonly spherical = new Spherical();
    public static readonly matrix4 = new Matrix4();

    public static readonly pixelDelta = new Vector2();
    public static readonly panDelta = new Vector3();
    public static readonly matrix3 = new Matrix3();

    public static readonly NONE = -1;
    public static readonly PAN = 0;
    public static readonly ZOOM = 1;
    public static readonly ROTATE = 2;

}

export class OrbitControls {

    public readonly dispose: () => void;

    public readonly viewPoint = new Vector3();

    private state = Helper.NONE;

    private readonly rotateStart = new Vector2();
    private readonly rotateEnd = new Vector2();
    private readonly rotateDelta = new Vector2();

    private readonly panStart = new Vector2();
    private readonly panEnd = new Vector2();
    private readonly panOffset = new Vector3();

    private zoom = 1;

    public constructor(

        private readonly canvas: HTMLCanvasElement,
        private readonly camera: Camera,

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

    public update(delta: number): void {

        const position = this.camera.position;
        const rotation = this.camera.rotation;

        const offset = Helper.offset;
        const spherical = Helper.spherical;
        const matrix = Helper.matrix4;

        offset.subVectors(position, this.viewPoint);
        spherical.setFromVector3(offset);

        // 减号目的在于让物体变换的方向和鼠标移动方向一致
        spherical.theta -= this.rotateDelta.x;
        spherical.phi -= this.rotateDelta.y;
        spherical.makeSafe();

        spherical.radius *= this.zoom;
        spherical.toVector3(offset);

        this.viewPoint.sub(this.panOffset);

        position.copy(this.viewPoint);
        position.add(offset);

        this.panOffset.setScalar(0);
        this.rotateDelta.setScalar(0);
        this.zoom = 1;

        matrix.makeLookAt(position, this.viewPoint);
        matrix.extractRotation(rotation);

    }

    private rotate(pixelDelta: Vector2): void {

        // 以 [画布高度 = 2PI] 为基准，计算 xy 移动的等比例弧度
        pixelDelta.multiplyScalar(2 * Math.PI / this.canvas.height);

        // 累计计算结果
        this.rotateDelta.add(pixelDelta);

    }

    private pan(pixelDelta: Vector2): void {

        const panDelta = Helper.panDelta;
        const matrix3 = Helper.matrix3;

        let edge = 1;

        if (this.camera instanceof PerspectiveCamera) {

            // fov / 2 = 夹角
            // 摄像机 - 视点 = 临边
            // 对边 / 邻边 = tan(夹角)

            const fov = this.camera.fov;
            const position = this.camera.position;

            const halfFov = fov / 360 * Math.PI;
            edge = position.distanceTo(this.viewPoint);
            edge *= Math.tan(halfFov);

            // 以 [画布高度 = fov 垂直距离] 为基准，计算 xy 移动的等比例距离
            pixelDelta.multiplyScalar(2 * edge / this.canvas.height);

        } else if (this.camera instanceof OrthographicCamera) {

            const left = this.camera.left;
            const right = this.camera.right;
            const top = this.camera.top;
            const bottom = this.camera.bottom;

            pixelDelta.x *= (right - left) / this.canvas.width;
            pixelDelta.y *= (top - bottom) / this.canvas.height;

        }

        // 从相机空间转换到世界空间，-y 是因为像素 ↓ 为正 webgl ↑ 为正

        panDelta.set(pixelDelta.x, -pixelDelta.y, 0);
        matrix3.setFromMatrix4(this.camera.worldMatrix);
        panDelta.applyMatrix3(matrix3);

        this.panOffset.add(panDelta);

    }

    private onContextMenu(event: Event): void {

        event.preventDefault();

    }

    private onPointerDown(event: PointerEvent): void {

        this.canvas.setPointerCapture(event.pointerId);

        if (event.button === 0) {

            this.state = Helper.ROTATE;
            this.rotateStart.set(event.clientX, event.clientY);

        } else if (event.button === 2) {

            this.state = Helper.PAN;
            this.panStart.set(event.clientX, event.clientY);

        }

    }

    private onPointerMove(event: PointerEvent): void {

        const pixelDelta = Helper.pixelDelta;

        if (this.state === Helper.ROTATE) {

            this.rotateEnd.set(event.clientX, event.clientY);
            pixelDelta.subVectors(this.rotateEnd, this.rotateStart);
            this.rotateStart.copy(this.rotateEnd);

            this.rotate(pixelDelta);

        }

        if (this.state === Helper.PAN) {

            this.panEnd.set(event.clientX, event.clientY);
            pixelDelta.subVectors(this.panEnd, this.panStart);
            this.panStart.copy(this.panEnd);

            this.pan(pixelDelta);

        }

    }

    private onPointerUp(event: PointerEvent): void {

        this.canvas.releasePointerCapture(event.pointerId);
        this.state = Helper.NONE;

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

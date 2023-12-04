import { CanvasElement } from "../../bases/CanvasElement";
import { Matrix4 } from "../../struct/Matrix4";
import { Vector3 } from "../../struct/Vector3";
import { TRSObject } from "../TRSObject";

const _m4 = /*@__PURE__*/ new Matrix4();

export class Camera extends TRSObject {

    public static events = { updateViewMatrix: 'updateviewmatrix' };

    private updateViewMatrixEvent = { type: Camera.events.updateViewMatrix };

    public fov = 50;
    public aspect = 1;
    public near = 0.001;
    public far = 2000;

    public readonly viewMatrix = new Matrix4();
    public readonly projectionMatrix = new Matrix4();

    public constructor(private element: CanvasElement) {

        super();

        this.translation.set(0, 0, 0.01);
        this.updateProjectionMatrix();

        this.element.addEventListener(CanvasElement.events.resize, this.onResize, this);

    }

    private onResize(): void {

        this.aspect = this.element.width / this.element.height;

        this.updateProjectionMatrix();

    }

    public updateViewMatrix(): void {

        super.updateMatrix();

        this.viewMatrix.copy(this.matrix).invert();

this.dispatchEvent(this.updateViewMatrixEvent);

    }

    public updateProjectionMatrix(): void {

        const near = this.near;
        const fov = this.fov / 180 * Math.PI;

        // near 范围的 top bottom right left

        const top = near * Math.tan(fov * 0.5);
        const bottom = -top;
        const right = top * this.aspect;
        const left = -right;

        const far = this.far;

        /**
         * 
         * 计算透视投影矩阵
         * 
         * 先将平头锥体计算为正方体
         * 		使用 near 范围的 left, right, top, bottom
         * 		计算线性到 far 范围内的 xy 平面上的缩放
         * 
         * 再将正方体缩放到 -1 到 1 范围内
         * 
         */

        const te = this.projectionMatrix.elements;

        const x = (2 * near) / (right - left);
        const y = (2 * near) / (top - bottom);

        const a = (right + left) / (right - left);
        const b = (top + bottom) / (top - bottom);
        const c = -(far + near) / (far - near);
        const d = (-2 * far * near) / (far - near);

        te[0] = x, te[1] = 0, te[2] = 0, te[3] = 0;
        te[4] = 0, te[5] = y, te[6] = 0, te[7] = 0;
        te[8] = a, te[9] = b, te[10] = c, te[11] = -1;
        te[12] = 0, te[13] = 0, te[14] = d, te[15] = 0;

    }

    public lookAt(target: Vector3): void {

        _m4.lookAt(this.translation, target);

        this.rotation.setFromMatrix(_m4);

    }

}

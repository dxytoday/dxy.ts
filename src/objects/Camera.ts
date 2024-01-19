import { Matrix4 } from "../structs/Matrix4";
import { TRSNode } from "./TRSNode";

export class Camera extends TRSNode {

    public readonly viewMatrix = new Matrix4();
    public readonly projectionMatrix = new Matrix4();

    public fov = 50;
    public aspect = 1;
    public near = 0.001;
    public far = 2000;

    public constructor() {

        super();
        this.name = 'camera';

    }

    public override updateMatrix(updateParents?: boolean, updateChildren?: boolean): void {

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

}
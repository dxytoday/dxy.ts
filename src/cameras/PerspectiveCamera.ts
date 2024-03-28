import { Camera } from "./Camera";

export class PerspectiveCamera extends Camera {

    public constructor(

        public fov = 50,
        public aspect = 1,
        public near = 0.1,
        public far = 2000,

    ) {

        super();

        this.updateProjectionMatrix();

    }

    public updateProjectionMatrix(): void {

        const fovRadian = this.fov / 180 * Math.PI;

        // 使用 near 的距离计算近平面的 top bottom right left

        const top = this.near * Math.tan(fovRadian * 0.5);
        const bottom = -top;
        const right = top * this.aspect;
        const left = -right;

        this.projectionMatrix.makePerspective(left, right, top, bottom, this.near, this.far);

    }

}
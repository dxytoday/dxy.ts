import { Camera } from "./Camera";

export class OrthographicCamera extends Camera {

    public constructor(

        public left = -50,
        public right = 50,
        public top = 50,
        public bottom = -50,
        public near = 1,
        public far = 200

    ) {

        super();

        this.updateProjectionMatrix();

    }

    public updateProjectionMatrix(): void {

        const dx = (this.right - this.left) / 2;
        const dy = (this.top - this.bottom) / 2;
        const cx = (this.right + this.left) / 2;
        const cy = (this.top + this.bottom) / 2;

        const left = cx - dx;
        const right = cx + dx;
        const top = cy + dy;
        const bottom = cy - dy;

        this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far);

    }

}
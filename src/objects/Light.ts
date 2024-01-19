import { Color } from "../structs/Color";
import { Vector3 } from "../structs/Vector3";
import { Camera } from "./Camera";
import { TRSNode } from "./TRSNode";

export class Light extends TRSNode {

    public readonly lightColor = new Color(1, 1, 1);
    public lightIntensity = 1;

    public target = new Vector3(0, 0, 0);

    public readonly color = new Color(1, 1, 1);
    public readonly direction = new Vector3(0, 1, 0);

    public constructor() {

        super();
        this.name = 'light';

    }

    public update(camera: Camera): void {

        this.color.set(this.lightColor);
        this.color.multiply(this.lightIntensity);

        this.direction.set(this.position);
        this.direction.sub(this.target);

        const matrix = camera.viewMatrix.getLinearMatrix();
        this.direction.multiply(matrix);

    }

}
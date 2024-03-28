import { Color } from "../math/Color";

export abstract class Light {

    public readonly color = new Color(1, 1, 1);
    public intensity = 1;

    public readonly lightColor = new Color();

    public update(): void {

        this.lightColor.copy(this.color);
        this.lightColor.multiplyScalar(this.intensity);

    }

}

import { Color } from "../../struct/Color";
import { TRSObject } from "../TRSObject";

export class Light extends TRSObject {

	public readonly lightColor = new Color(1, 1, 1);
	public lightIntensity = 1;

	public readonly color = new Color(1, 1, 1);

	public update(): void {

		this.color.copy(this.lightColor);
		this.color.multiplyScalar(this.lightIntensity);

	}

}
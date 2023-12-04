import { Vector2 } from "../../struct/Vector2";
import { Vector3 } from "../../struct/Vector3";
import { Camera } from "../camera/Camera";
import { Light } from "./Light";

export class SpotLight extends Light {

	public readonly position = new Vector3();
	public readonly cutOff = new Vector2(0.9961946980917455, 0.6427876096865394);

	public constructor(private camera: Camera) {

		super();

		this.camera.addEventListener(Camera.events.updateViewMatrix, this.update, this);

	}

	public override update(event?: AnyEvent): void {

		if (event === undefined) {

			super.update();

		}

		this.position.copy(this.translation);
		this.position.applyMatrix4(this.camera.viewMatrix);

	}

}
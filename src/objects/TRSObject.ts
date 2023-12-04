import { EventDispatcher } from "../bases/EventDispatcher";
import { Matrix4 } from "../struct/Matrix4";
import { Quaternion } from "../struct/Quaternion";
import { Vector3 } from "../struct/Vector3";

export class TRSObject extends EventDispatcher {

	public name = ''

	public readonly translation = new Vector3(0, 0, 0);
	public readonly rotation = new Quaternion(0, 0, 0, 1);
	public readonly scale = new Vector3(1, 1, 1);

	public readonly matrix = new Matrix4();

	public visible = true;

	public updateMatrix(): void {

		this.matrix.compose(this.translation, this.rotation, this.scale);

	}

	public toJSON(): object {

		return {

			name: this.name,

			translation: this.translation.toJSON(),
			rotation: this.rotation.toEuler(),
			scale: this.scale.toJSON(),

			visible: this.visible,

		};

	}

}
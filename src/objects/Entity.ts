import { Matrix3 } from "../struct/Matrix3";
import { Matrix4 } from "../struct/Matrix4";
import { Attribute } from "./modules/Attribute";
import { Geometry } from "./modules/Geometry";
import { Material } from "./modules/Material";
import { TRSNode } from "./TRSNode";

export class Entity extends TRSNode {

	public readonly normalMatrix = new Matrix3();
	public readonly modelViewMatrix = new Matrix4();

	public constructor(

		public geometry?: Geometry,
		public material?: Material | Material[],

	) {

		super();

	}

	public updateModelViewMatrix(viewMatrix: Matrix4): void {

		this.modelViewMatrix.multiplyMatrices(viewMatrix, this.worldMatrix);
		this.normalMatrix.setNormalMatrix(this.modelViewMatrix);

	}

}

export class InstancedEntity extends Entity {

	public instanceMatrix: Attribute;
	public instanceColor: Attribute;
	public count = 0;

	public constructor(

		geometry?: Geometry,
		material?: Material | Material[],
		private maxMembers = 0,

	) {

		super(geometry, material);

		this.instanceMatrix = new Attribute(new Float32Array(this.maxMembers * 16), 16);

	}

	public setMaxMembers(maxMembers: number): void {

		if (maxMembers === this.maxMembers) {

			return;

		}

		this.maxMembers = maxMembers;

		this.instanceMatrix.dispose();

		this.instanceMatrix = new Attribute(new Float32Array(this.maxMembers * 16), 16);

	}

}
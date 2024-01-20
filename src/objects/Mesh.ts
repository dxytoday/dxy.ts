import { Material } from "../materials/Material";
import { Matrix3 } from "../structs/Matrix3";
import { Matrix4 } from "../structs/Matrix4";
import { Geometry } from "../modules/Geometry";
import { TRSNode } from "./TRSNode";
import { PBRMaterial } from "../materials/PBRMaterial";

export class Mesh extends TRSNode {

    public readonly normalMatrix = new Matrix3();
    public readonly modelViewMatrix = new Matrix4();

    public constructor(

        public geometry = new Geometry(),
        public material: Material | Material[] = new PBRMaterial(),

    ) {

        super();

    }

    public updateModelViewMatrix(viewMatrix: Matrix4): void {

        this.modelViewMatrix.multiplyMatrices(this.worldMatrix, viewMatrix);
        this.normalMatrix.makeNormalMatrix(this.modelViewMatrix);

    }

}
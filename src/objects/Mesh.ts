import { Material } from "../materials/Material";
import { PhysicalMaterial } from "../materials/PhysicalMaterial";
import { Geometry } from "../modules/Geometry";
import { TRSObject } from "../modules/TRSObject";

export class Mesh extends TRSObject {

    public constructor(

        public geometry = new Geometry(),
        public material: Material | Material[] = new PhysicalMaterial(),

    ) {

        super();

    }

}
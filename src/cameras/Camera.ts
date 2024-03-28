import { Frustum } from "../math/Frustum";
import { Matrix4 } from "../math/Matrix4";
import { Sphere } from "../math/Sphere";
import { Mesh } from "../objects/Mesh";
import { TRSObject } from "../modules/TRSObject";

abstract class Helper {

    public static readonly matrix4 = new Matrix4();
    public static readonly sphere = new Sphere();

}

export abstract class Camera extends TRSObject {

    public readonly viewMatrix = new Matrix4();
    public readonly projectionMatrix = new Matrix4();
    public readonly frustum = new Frustum();

    public constructor() {

        super();

        this.position.set(0, 1, 0);

    }

    public override updateMatrix(): void {

        super.updateMatrix();
        this.viewMatrix.copy(this.worldMatrix).invert();

        Helper.matrix4.multiplyMatrices(this.viewMatrix, this.projectionMatrix);
        this.frustum.setFromProjectionMatrix(Helper.matrix4);

    }

    public frustumCulling(mesh: Mesh): boolean {

        Helper.sphere.copy(mesh.geometry.boundingSphere);
        Helper.sphere.applyMatrix4(mesh.worldMatrix);

        return this.frustum.intersectsSphere(Helper.sphere);

    }

    public abstract updateProjectionMatrix(): void;

}

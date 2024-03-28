import { Vector3 } from "./Vector3";

abstract class Helper {

    public static readonly EPS = 0.000001;

}

export class Spherical {

    public constructor(

        public radius = 1,

        /** 俯仰角 0 指向 +y 方向，增加向 +z 方向，0 - 2PI */
        public phi = 0,

        /** 方位角 0 指向 +z 方向，增加向 +x 方向，0 - 2PI */
        public theta = 0,

    ) { }

    public setFromVector3(v: Vector3): Spherical {

        this.radius = v.length();

        if (this.radius === 0) {

            this.theta = 0;
            this.phi = 0;

        } else {

            this.theta = Math.atan2(v.x, v.z);
            this.phi = Math.acos(v.y / this.radius);

        }

        return this;

    }

    public toVector3(target: Vector3): Vector3 {

        const sinPhiRadius = Math.sin(this.phi) * this.radius;

        target.x = sinPhiRadius * Math.sin(this.theta);
        target.y = Math.cos(this.phi) * this.radius;
        target.z = sinPhiRadius * Math.cos(this.theta);

        return target;

    }

    public makeSafe(): Spherical {

        this.phi = Math.max(Helper.EPS, Math.min(this.phi, Math.PI - Helper.EPS));

        return this;

    }

}
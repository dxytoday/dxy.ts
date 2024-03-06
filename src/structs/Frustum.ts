import { Matrix4 } from "./Matrix4";
import { Plane } from "./Plane";
import { Sphere } from "./Sphere";

export class Frustum {

    public readonly planes = [new Plane(), new Plane(), new Plane(), new Plane(), new Plane(), new Plane()];

    public setFromProjectionMatrix(m: Matrix4): Frustum {

        /**
         *      m 为包含投影变换的矩阵
         *  
         *      坐标乘以该矩阵后得到 NDC 坐标
         *      如果 NDC 的三个值在 +1 到 -1 范围内
         *      就判定为在视锥内
         * 
         *      https://zhuanlan.zhihu.com/p/491340245
         * 
         */

        const planes = this.planes;
        const me = m.elements;

        const me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
        const me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
        const me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
        const me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];

        planes[0].setComponents(me3 - me0, me7 - me4, me11 - me8, me15 - me12).normalize();
        planes[1].setComponents(me3 + me0, me7 + me4, me11 + me8, me15 + me12).normalize();
        planes[2].setComponents(me3 + me1, me7 + me5, me11 + me9, me15 + me13).normalize();
        planes[3].setComponents(me3 - me1, me7 - me5, me11 - me9, me15 - me13).normalize();
        planes[4].setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14).normalize();
        planes[5].setComponents(me3 + me2, me7 + me6, me11 + me10, me15 + me14).normalize();

        return this;

    }

    public intersectsSphere(sphere: Sphere): boolean {

        const planes = this.planes;
        const center = sphere.center;
        const negRadius = - sphere.radius;

        for (let i = 0; i < 6; i++) {

            const distance = planes[i].distanceToPoint(center);

            if (distance < negRadius) {

                return false;

            }

        }

        return true;

    }


}
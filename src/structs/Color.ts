import { Vector3 } from "./Vector3";

class Helper {

    public static fromStyle(style: string): number[] {

        let execArray: RegExpExecArray | null;

        if (execArray = /^(\w+)\(([^\)]*)\)/.exec(style)) {

            return Helper.fromRGB(execArray);

        }

        if (execArray = /^\#([A-Fa-f\d]+)$/.exec(style)) {

            return Helper.fromHex(execArray);

        }

        return [0, 0, 0];

    }

    public static fromRGB(array: RegExpExecArray): number[] {

        const name = array[1];
        const result = [0, 0, 0];

        if (name === 'rgb' || name === 'rgba') {

            const components = array[2];
            let color: RegExpExecArray | null;

            if (color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {

                // rgb(255, 0, 0) rgba(255, 0, 0, 0.5)

                result[0] = Math.min(255, parseInt(color[1], 10)) / 255;
                result[1] = Math.min(255, parseInt(color[2], 10)) / 255;
                result[2] = Math.min(255, parseInt(color[3], 10)) / 255;

            }

            if (color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {

                // rgb(100%, 0%, 0%) rgba(100%, 0%, 0%, 0.5)

                result[0] = Math.min(100, parseInt(color[1], 10)) / 100;
                result[1] = Math.min(100, parseInt(color[2], 10)) / 100;
                result[2] = Math.min(100, parseInt(color[3], 10)) / 100;

            }

        }

        return result;

    }

    public static fromHex(array: RegExpExecArray): number[] {

        const hex = array[1];
        const size = hex.length;

        const result = [0, 0, 0];

        if (size === 3) {

            // #ff0

            result[0] = parseInt(hex.charAt(0), 16) / 15;
            result[1] = parseInt(hex.charAt(1), 16) / 15;
            result[2] = parseInt(hex.charAt(2), 16) / 15;

        } else if (size === 6) {

            // #ff0000

            const h = parseInt(hex, 16);

            result[0] = (h >> 16 & 255) / 255;
            result[1] = (h >> 8 & 255) / 255;
            result[2] = (h & 255) / 255;

        }

        return result;

    }

    public static SRGBToLinear(c: number): number {

        return (c < 0.04045) ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);

    }

}

export class Color {

    public constructor(

        public r = 1,
        public g = 1,
        public b = 1,

    ) { }

    public set(r: number, g: number, b: number): Color {

        this.r = Helper.SRGBToLinear(r);
        this.g = Helper.SRGBToLinear(g);
        this.b = Helper.SRGBToLinear(b);

        return this;

    }

    public setStyle(style: string): Color {

        const [r, g, b] = Helper.fromStyle(style);

        this.set(r, g, b);

        return this;

    }

    public copy(color: Color): Color {

        this.r = color.r;
        this.g = color.g;
        this.b = color.b;

        return this;

    }

    public setFromArray(array: number[], offset = 0): Color {

        this.r = array[offset];
        this.g = array[offset + 1];
        this.b = array[offset + 2];

        return this;

    }

    public multiplyScalar(scalar: number): Color {

        this.r *= scalar;
        this.g *= scalar;
        this.b *= scalar;

        return this;

    }

    public toVector3(target: Vector3): Vector3 {

        target.x = this.r;
        target.y = this.g;
        target.z = this.b;

        return target;

    }

}
import { Vector3 } from "./Vector3";

export class Color extends Vector3 {

    public constructor(r = 1, g = 1, b = 1) {

        super(r, g, b);

    }

    public get r(): number {

        return this.x;
    }

    public set r(r: number) {

        this.x = r;

    }

    public get g(): number {

        return this.y;
    }

    public set g(g: number) {

        this.y = g;

    }

    public get b(): number {

        return this.z;
    }

    public set b(b: number) {

        this.z = b;

    }

    public setStyle(style: string): Color {

        let m;

        if (m = /^(\w+)\(([^\)]*)\)/.exec(style)) {

            // rgb / hsl

            let color;
            const name = m[1];
            const components = m[2];

            if (name === 'rgb' || name === 'rgba') {

                if (color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {

                    // rgb(255, 0, 0) rgba(255, 0, 0, 0.5)

                    this.r = Math.min(255, parseInt(color[1], 10)) / 255;
                    this.g = Math.min(255, parseInt(color[2], 10)) / 255;
                    this.b = Math.min(255, parseInt(color[3], 10)) / 255;

                }

                if (color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {

                    // rgb(100%, 0%, 0%) rgba(100%, 0%, 0%, 0.5)

                    this.r = Math.min(100, parseInt(color[1], 10)) / 100;
                    this.g = Math.min(100, parseInt(color[2], 10)) / 100;
                    this.b = Math.min(100, parseInt(color[3], 10)) / 100;

                }

            } else if (name === 'hsl' || name === 'hsla') {

            }

        } else if (m = /^\#([A-Fa-f\d]+)$/.exec(style)) {

            // hex color

            const hex = m[1];
            const size = hex.length;

            if (size === 3) {

                // #ff0
                this.r = parseInt(hex.charAt(0), 16) / 15;
                this.g = parseInt(hex.charAt(1), 16) / 15;
                this.b = parseInt(hex.charAt(2), 16) / 15;

            } else if (size === 6) {

                // #ff0000

                const h = parseInt(hex, 16);

                this.r = (h >> 16 & 255) / 255;
                this.g = (h >> 8 & 255) / 255;
                this.b = (h & 255) / 255;

            }

        }

        return this;

    }

}
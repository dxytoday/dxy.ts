import { BgMaterial } from "../materials/BgMaterial";
import { Attribute } from "../modules/Attribute";
import { Geometry } from "../modules/Geometry";
import { Texture } from "../modules/Texture";
import { Color } from "../structs/Color";
import { Light } from "./Light";
import { Mesh } from "./Mesh";
import { TRSNode } from "./TRSNode";

export class Scene extends TRSNode {

    public background: undefined | Color | Mesh;

    public readonly ambientLight: Light;
    public readonly directionalLight: Light;

    public constructor() {

        super();
        this.name = 'scene';

        this.ambientLight = new Light();
        this.directionalLight = new Light();

    }

    public updateMatrix(updateParents?: boolean, updateChildren?: boolean): void {

        super.updateMatrix(updateParents, updateChildren);

        this.ambientLight.updateMatrix();
        this.directionalLight.updateMatrix();

    }

    public setBackgroundColor(color: string): void {

        if (this.background instanceof Mesh) {

            // dispose

        }

        this.background = new Color();
        this.background.setStyle(color);

    }

    public setBackgroundImage(image: HTMLImageElement): void {

        if (

            !(this.background instanceof Mesh) ||
            this.background.name !== 'image-background'

        ) {

            // dispose

            const vertices = [-1, 1, -1, -1, 1, 1, -1, -1, 1, -1, 1, 1,];
            const position = new Attribute(new Float32Array(vertices), 2);

            const uvs = [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1];
            const uv = new Attribute(new Float32Array(uvs), 2);

            const geometry = new Geometry();
            geometry.setAttribute('position', position);
            geometry.setAttribute('uv', uv);

            this.background = new Mesh(geometry, new BgMaterial());
            this.background.name = 'image-background';

        }

        const material = this.background.material as BgMaterial;
        material.map = new Texture(image);

    }

    public setBackgroundCube(image: HTMLImageElement): void {

        if (

            !(this.background instanceof Mesh) ||
            this.background.name !== 'image-background'

        ) {

            // dispose

            const vertices = [-1, 1, -1, -1, 1, 1, -1, -1, 1, -1, 1, 1,];
            const position = new Attribute(new Float32Array(vertices), 2);

            const uvs = [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1];
            const uv = new Attribute(new Float32Array(uvs), 2);

            const geometry = new Geometry();
            geometry.setAttribute('position', position);
            geometry.setAttribute('uv', uv);

            this.background = new Mesh(geometry, new BgMaterial());
            this.background.name = 'cube-background';

        }

        const material = this.background.material as BgMaterial;
        material.map = new Texture(image);

    }

}
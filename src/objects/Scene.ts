import { Color } from "../math/Color";
import { Mesh } from "./Mesh";
import { TRSObject } from "../modules/TRSObject";
import { ImageTexture } from "../textures/ImageTexture";
import { CubeTexture } from "../textures/CubeTexture";
import { AmbientLight } from "../lights/AmbientLight";
import { DirectionalLight } from "../lights/DirectionalLight";
import { Attribute } from "../modules/Attribute";
import { Geometry } from "../modules/Geometry";
import { ImageMaterial } from "../materials/ImageMaterial";
import { CubeMaterial } from "../materials/CubeMaterial";
import { Camera } from "../cameras/Camera";

abstract class Helper {

    public static readonly COLOR = 0;
    public static readonly IMAGE = 1;
    public static readonly CUBE = 2;

    public static createImageMesh(): Mesh {

        const vertices = [-1, 1, -1, -1, 1, 1, -1, -1, 1, -1, 1, 1];
        const uvs = [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1];

        const geometry = new Geometry();
        geometry.setAttribute('position', Attribute.createF2(vertices));
        geometry.setAttribute('uv', Attribute.createF2(uvs));

        return new Mesh(geometry, new ImageMaterial());

    }

    public static createCubeMesh(): Mesh {

        const DLF = [-0.5, -0.5, 0.5]; // down left front 1
        const DRF = [0.5, -0.5, 0.5]; // down right front 2
        const URF = [0.5, 0.5, 0.5]; // up right font 3
        const ULF = [-0.5, 0.5, 0.5]; // up left front 4
        const DLB = [-0.5, -0.5, -0.5]; // down left back 5
        const DRB = [0.5, -0.5, -0.5]; // down right back 6
        const URB = [0.5, 0.5, -0.5]; // up right back 7
        const ULB = [-0.5, 0.5, -0.5]; // up left back 8

        const vertices = [

            ULF, ULB, URB, ULF, URB, URF, // up
            DLB, DLF, DRF, DLB, DRF, DRB, // down
            DLB, ULB, ULF, DLB, ULF, DLF, // left
            DRF, URF, URB, DRF, URB, DRB, // right
            DLF, ULF, URF, DLF, URF, DRF, // front
            DRB, URB, ULB, DRB, ULB, DLB, // back

        ].flat();

        const geometry = new Geometry();
        geometry.setAttribute('position', Attribute.createF3(vertices));

        return new Mesh(geometry, new CubeMaterial());

    }

}

export class Scene extends TRSObject {

    public readonly backgroundColor = new Color(0, 0, 0);
    public readonly backgroundImage = Helper.createImageMesh();
    public readonly backgroundCube = Helper.createCubeMesh();

    public bgType = Helper.COLOR;

    public readonly ambientLight = new AmbientLight();
    public readonly directionalLight = new DirectionalLight();

    public updateLights(camera: Camera): void {

        this.ambientLight.update();
        this.directionalLight.update(camera);

    }

    public setBackgroundColor(color: string): void {

        this.backgroundColor.setStyle(color);

        this.bgType = Helper.COLOR;

    }

    public setBackgroundImage(texture: ImageTexture): void {

        const material = this.backgroundImage.material as ImageMaterial;

        // material.map && material.map.dispose();
        material.map = texture;

        this.bgType = Helper.IMAGE;

    }

    public setBackgroundCube(cubeTexture: CubeTexture): void {

        const material = this.backgroundCube.material as CubeMaterial;

        // material.cube && material.cube.dispose();
        material.cube = cubeTexture;

        this.bgType = Helper.CUBE;

    }

    public getBackground(): Color | Mesh {

        switch (this.bgType) {

            case Helper.COLOR: return this.backgroundColor;
            case Helper.IMAGE: return this.backgroundImage;
            case Helper.CUBE: return this.backgroundCube;

        }

        return this.backgroundColor;

    }

}
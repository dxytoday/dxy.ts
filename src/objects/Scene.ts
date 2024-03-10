import { BGMaterial } from "../materials/background/BGMaterial";
import { Attribute } from "../modules/Attribute";
import { Geometry } from "../modules/Geometry";
import { CubeTexture, TexImage, Texture } from "../modules/Texture";
import { Color } from "../structs/Color";
import { Camera } from "../cameras/Camera";
import { DirectionalLight, AmbientLight } from "../lights/Light";
import { Mesh } from "./Mesh";
import { TRSObject } from "./TRSObject";

export class Scene extends TRSObject {

    private static planeMesh: Mesh | undefined;
    private static cubeMesh: Mesh | undefined;

    public background: undefined | Color | Mesh;

    public readonly ambientLight: AmbientLight;
    public readonly directionalLight: DirectionalLight;

    public constructor() {

        super();
        this.name = 'scene';

        this.ambientLight = new AmbientLight();
        this.directionalLight = new DirectionalLight();

    }

    public override updateMatrix(): void {

        super.updateMatrix();

        this.ambientLight.updateMatrix();
        this.directionalLight.updateMatrix();

    }

    public updateLights(camera: Camera): void {

        this.ambientLight.update();
        this.directionalLight.update(camera);

    }

    public setBackgroundColor(color: string): void {

        if (this.background instanceof Mesh) {

            this.background.dispose();

        }

        this.background = new Color();
        this.background.setStyle(color);

    }

    public setBackgroundImage(image: TexImage): void {

        if (!Scene.planeMesh) {

            const vertices = [-1, 1, -1, -1, 1, 1, -1, -1, 1, -1, 1, 1];
            const position = new Attribute(new Float32Array(vertices), 2);

            const uvs = [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1];
            const uv = new Attribute(new Float32Array(uvs), 2);

            const geometry = new Geometry();
            geometry.setAttribute('position', position);
            geometry.setAttribute('uv', uv);

            Scene.planeMesh = new Mesh(geometry, new BGMaterial());

        }

        this.background = Scene.planeMesh;

        const material = this.background.material as BGMaterial;
        material.map && material.map.dispose();
        material.map = new Texture(image);

    }

    public setBackgroundCube(images: TexImage[]): void {

        if (!Scene.cubeMesh) {

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

            const position = new Attribute(new Float32Array(vertices), 3);

            const geometry = new Geometry();
            geometry.setAttribute('position', position);

            const material = new BGMaterial();
            material.isCube = true;

            Scene.cubeMesh = new Mesh(geometry, material);

        }

        this.background = Scene.cubeMesh;

        const material = this.background.material as BGMaterial;
        material.cube && material.cube.dispose();
        material.cube = new CubeTexture(images);

    }

}
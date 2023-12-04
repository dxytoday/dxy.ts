import { Context } from "./Context";
import { GLBLoader } from "./loaders/GLBLoader";
import { Entity } from "./objects/Entity";
import { TRSNode } from "./objects/TRSNode";
import { Attribute } from "./objects/modules/Attribute";
import { Geometry } from "./objects/modules/Geometry";
import { Material, MeshMaterial } from "./objects/modules/Material";
import { Texture } from "./objects/modules/Texture";
import { Vector3 } from "./struct/Vector3";

/** 接口类 */
export default class Dxy {

	private context: Context;

	public constructor(public canvas = document.createElement('canvas')) {

		this.context = new Context(canvas);

	}

	public setBackground(color: any): void {

		if (!color) {

			return;

		}

		const r = color.r / 255;
		const g = color.g / 255;
		const b = color.b / 255;
		const a = color.a === undefined ? 1 : color.a / 255;

		this.context.renderer.setClearColor(r, g, b, a);

	}

	public setCamera(camera: any): void {

		if (!camera) {

			return;

		}

		let needsUpdate = false;

		if (camera.translation !== undefined) {

			this.context.camera.translation.x = camera.translation.x;
			this.context.camera.translation.y = camera.translation.y;
			this.context.camera.translation.z = camera.translation.z;

			needsUpdate = true;

		}

		if (camera.target !== undefined) {

			const target = new Vector3();
			target.x = camera.target.x;
			target.y = camera.target.y;
			target.z = camera.target.z;

			this.context.camera.lookAt(target)

			needsUpdate = true;

		}

		if (needsUpdate) {

			this.context.camera.updateViewMatrix();

		}

	}

	public setAmbient(intensity: number): void {

		if (intensity === undefined) {

			return;

		}

		this.context.ambientLight.lightIntensity = intensity;

		this.context.ambientLight.update();

	}

	public setSpotLight(light: any): void {

		if (light.translation !== undefined) {

			this.context.spotLight.translation.x = light.translation.x;
			this.context.spotLight.translation.y = light.translation.y;
			this.context.spotLight.translation.z = light.translation.z;

		}

		if (light.brightness !== undefined) {

			this.context.spotLight.lightIntensity = light.brightness;

		}

		if (light.cutOff !== undefined) {

			this.context.spotLight.cutOff.x = Math.cos(light.cutOff.x / 180 * Math.PI);
			this.context.spotLight.cutOff.y = Math.cos(light.cutOff.y / 180 * Math.PI);

		}

		this.context.spotLight.update();

	}

	public loadGLB(url: string, onLoad: Function): void {

		if (!url) {

			return;

		}

		GLBLoader.load(url, (scene: TRSNode) => {

			this.context.scene.add(scene);

			onLoad && onLoad(true);

		});

	}

	public addThreeObject(threeObject: any): void {

		const node = _convertThreeObject(threeObject);

		this.context.scene.add(node);

	}

}

function _convertThreeObject(threeObject: any): TRSNode {

	function fromThreeGeometry(threeGeometry: any): Geometry {

		const geometry = new Geometry();

		for (const key in threeGeometry.attributes) {

			const threeAttribute = threeGeometry.attributes[key];

			const attribute = new Attribute(threeAttribute.array, threeAttribute.itemSize, threeAttribute.normalized);

			geometry.setAttribute(key, attribute);

		}

		geometry.groups.push(...threeGeometry.groups);

		const threeIndex = threeGeometry.index;

		geometry.indices = new Attribute(threeIndex.array, threeIndex.itemSize, threeIndex.normalized);

		return geometry;

	}

	function fromThreeMaterial(threeMaterial: any): Material {

		const material = new MeshMaterial();

		material.opacity = threeMaterial.opacity;

		material.color.r = threeMaterial.color.r;
		material.color.g = threeMaterial.color.g;
		material.color.b = threeMaterial.color.b;

		if (threeMaterial.map !== null) {

			const texture = new Texture(threeMaterial.map.image);

			// texture.magFilter = threeMaterial.map.magFilter;
			// texture.minFilter = threeMaterial.map.minFilter;
			// texture.wrapS = threeMaterial.map.wrapS;
			// texture.wrapT = threeMaterial.map.wrapT;

			// texture.flipY = threeMaterial.map.flipY;
			// texture.unpackAlignment = threeMaterial.map.unpackAlignment;
			// texture.generateMipmap = threeMaterial.map.generateMipmaps;

			material.map = texture;

		}

		return material;

	}

	function setThreeObject(node: TRSNode, threeObject: any): void {

		node.name = threeObject.name;

		node.translation.x = threeObject.position.x;
		node.translation.y = threeObject.position.y;
		node.translation.z = threeObject.position.z;

		node.scale.x = threeObject.scale.x;
		node.scale.y = threeObject.scale.y;
		node.scale.z = threeObject.scale.z;

		node.rotation.x = threeObject.quaternion.x;
		node.rotation.y = threeObject.quaternion.y;
		node.rotation.z = threeObject.quaternion.z;
		node.rotation.w = threeObject.quaternion.w;

	}

	function fromThreeObject(threeObject: any): TRSNode {

		let node: TRSNode;

		if (threeObject.isMesh === true) {

			const geometry = fromThreeGeometry(threeObject.geometry);

			let material: Material | Material[];

			if (Array.isArray(threeObject.material)) {

				material = [];

				for (const threeMaterial of threeObject.material) {

					material.push(fromThreeMaterial(threeMaterial));

				}

			} else {

				material = fromThreeMaterial(threeObject.material);

			}

			node = new Entity(geometry, material);

		} else if (threeObject.isObject3D === true) {

			node = new TRSNode();

		}

		setThreeObject(node, threeObject);

		for (const threeChild of threeObject.children) {

			const child = this.fromThreeObject(threeChild);

			node.add(child);

		}

		return node;

	}

	return fromThreeObject(threeObject);

}

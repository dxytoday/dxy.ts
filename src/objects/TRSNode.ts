import { Matrix4 } from "../struct/Matrix4";
import { TRSObject } from "./TRSObject";

export class TRSNode extends TRSObject {

	public parent: TRSNode | undefined;
	public readonly children: TRSNode[] = [];

	public readonly worldMatrix = new Matrix4();

	public updateWorldMatrix(): void {

		this.updateMatrix();

		if (this.parent === undefined) {

			this.worldMatrix.copy(this.matrix);

		} else {

			this.worldMatrix.multiplyMatrices(this.parent.worldMatrix, this.matrix);

		}

	}

	public add(node: TRSNode): TRSNode | undefined {

		if (node === undefined) {

			return;

		}

		if (node === this) {

			return;

		}

		if (node.parent !== undefined) {

			node.parent.remove(node);

		}

		node.parent = this;
		this.children.push(node);

		return this;

	}

	public remove(node: TRSNode): TRSNode | undefined {

		if (node === undefined) {

			return;

		}

		if (node === this) {

			return;

		}

		const index = this.children.indexOf(node);

		if (index === -1) {

			return;

		}

		node.parent = undefined;
		this.children.splice(index, 1);

		return this;

	}

	public get(name: string): TRSNode | undefined {

		for (const child of this.children) {

			if (child.name !== name) {

				continue;

			}

			return child;

		}

	}

	public clear(): void {

		for (const child of this.children) {

			child.parent = undefined;

		}

		this.children.length = 0;

	}

	public traverse(callback: Function): boolean {

		let result: boolean = callback(this);

		if (result === false) return result;

		for (const child of this.children) {

			result = child.traverse(callback);

			if (result === false) return result;

		}

		return true;

	}

	[Symbol.iterator]() {

		const array = this.children.slice();

		let index = 0;

		const result: { done: boolean, value?: TRSNode } = { done: false, value: undefined };

		return {

			next: () => {

				if (index < array.length) {

					result.done = false;
					result.value = array[index++];

				} else {

					result.done = true;
					result.value = undefined;

				}

				return result;

			}

		}

	}

}

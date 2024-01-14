export class EventDispatcher {

	private listeners: Map<string, Map<Function, object>> | undefined;

	public addEventListener(type: string, listener: Function, scope: object): void {

		if (this.listeners === undefined) {

			this.listeners = new Map<string, Map<Function, object>>();

		}

		let listeners = this.listeners.get(type);

		if (listeners === undefined) {

			listeners = new Map<Function, object>();
			this.listeners.set(type, listeners);

		}

		listeners.set(listener, scope);

	}

	public removeEventListener(type: string, listener: Function): void {

		if (this.listeners === undefined) {

			return;

		}

		const listeners = this.listeners.get(type);

		if (listeners === undefined) {

			return;

		}

		listeners.delete(listener);

	}

	protected dispatchEvent(event: IAnyEvent) {

		if (this.listeners === undefined) {

			return;

		}

		const listeners = this.listeners.get(event.type);

		if (listeners === undefined) {

			return;

		}

		event.source = this;

		// 获取一个副本，防止在迭代过程中列表变化引起报错
		const entries = listeners.entries();

		for (const [listener, scope] of entries) {

			listener.call(scope, event);

		}

	}

}

export type EventParameters = {

    source?: EventObject;
    [propName: string]: any;

}

export class EventObject {

    private declare handlers: Map<string, Map<Function, Object>> | undefined;

    public on(eventName: string, handler: Function, scope: object): void {

        if (!this.handlers) {

            this.handlers = new Map<string, Map<Function, object>>();

        }

        let handlers = this.handlers.get(eventName);

        if (!handlers) {

            handlers = new Map<Function, object>();
            this.handlers.set(eventName, handlers);

        }

        handlers.set(handler, scope);

    }

    public off(eventName: string, handler: Function): void {

        if (!this.handlers) {

            return;

        }

        const handlers = this.handlers.get(eventName);

        if (handlers) {

            handlers.delete(handler);

        }

    }

    public emit(eventName: string, parameters: EventParameters = {}): void {

        if (!this.handlers) {

            return;

        }

        const handlers = this.handlers.get(eventName);

        if (handlers) {

            parameters.source = this;

            const entries = handlers.entries(); // 防止在迭代过程中列表变化引起报错

            for (const [handler, scope] of entries) {

                handler.call(scope, parameters);

            }

        }

    }

}
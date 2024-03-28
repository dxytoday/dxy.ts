import { Attribute } from "../../modules/Attribute";

export class WebGLAttribute {

    private readonly enableVAOs = new Set<WebGLVertexArrayObject>();
    private readonly pointerVAOs = new Map<WebGLVertexArrayObject, BufferPointer>();

    public constructor(

        private gl: WebGL2RenderingContext,
        private location: number,
        public name: string,

    ) { }

    public isEnable(vao: WebGLVertexArrayObject): boolean {

        return this.enableVAOs.has(vao);

    }

    public enable(vao: WebGLVertexArrayObject): void {

        if (this.isEnable(vao)) {

            return;

        }

        this.gl.enableVertexAttribArray(this.location);
        this.enableVAOs.add(vao);

    }

    public disable(vao: WebGLVertexArrayObject): void {

        if (!this.isEnable(vao)) {

            return;

        }

        this.gl.disableVertexAttribArray(this.location);
        this.enableVAOs.delete(vao);

    }

    public bind(attribute: Attribute, vao: WebGLVertexArrayObject, buffer: WebGLBuffer): void {

        const itemSize = attribute.itemSize;
        const dataType = attribute.dataType;
        const normalized = attribute.normalized;

        let bufferPointer = this.pointerVAOs.get(vao);

        if (!bufferPointer) {

            bufferPointer = {};
            this.pointerVAOs.set(vao, bufferPointer);

            this.enable(vao);

        }

        if (

            bufferPointer.buffer === buffer &&
            bufferPointer.size === itemSize &&
            bufferPointer.type == dataType &&
            bufferPointer.normalized === normalized

        ) {

            return;

        }

        bufferPointer.buffer = buffer;
        bufferPointer.size = itemSize;
        bufferPointer.type = dataType;
        bufferPointer.normalized = normalized;

        this.gl.vertexAttribPointer(
            this.location,
            itemSize,
            dataType,
            normalized,
            0,
            0,
        );

    }

}
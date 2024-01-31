import { Vector4 } from "../structs/Vector4";
import { WebGL } from "./WebGL";

export class WebGLState {


    public readonly clearColor = new Vector4(0, 0, 0, 0);
    public readonly viewport = new Vector4(0, 0, 0, 0);

    public program: WebGLProgram | undefined;
    public vao: WebGLVertexArrayObject | undefined;
    public arrayBuffer: WebGLBuffer | undefined;
    public elementArrayBuffer: WebGLBuffer | undefined;

    public readonly maxTextures: number;
    private textureUnits = 0;
    private textureUnit = 0;
    private texture2D: WebGLTexture | undefined;
    private textureCubeMap: WebGLTexture | undefined;

    public frontFace = false;

    private readonly stateCache = new Map<number, boolean>();

    public constructor(

        renderer: WebGL,
        private gl = renderer.gl,

    ) {

        this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

        gl.enable(gl.DEPTH_TEST);

        // gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);

        // gl.clearColor(0, 0, 0, 0);
        // gl.clearDepth(1);
        // gl.clearStencil(0);
        // gl.depthFunc(gl.LEQUAL);

        // gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);

        // gl.depthMask(true);

        // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    }

    public setClearColor(r: number, g: number, b: number, a = 1): void {

        if (!this.clearColor.equalsComponent(r, g, b, a)) {

            this.clearColor.set(r, g, b, a);
            this.gl.clearColor(r, g, b, a);

        }

    }

    public setViewport(x: number, y: number, width: number, height: number): void {

        if (!this.viewport.equalsComponent(x, y, width, height)) {

            this.viewport.set(x, y, width, height);
            this.gl.viewport(x, y, width, height);

        }

    }

    public useProgram(program: WebGLProgram): void {

        if (this.program !== program) {

            this.program = program;
            this.gl.useProgram(program);

        }

    }

    public resetTextureUnits(): void {

        this.textureUnits = 0;

    }

    public allocateTextureUnits(): number {

        const textureUnits = this.textureUnits;

        if (textureUnits >= this.maxTextures) {

            console.warn(`Dxy.WebGLState : 纹理单元超过了最大限制 ${textureUnits} . `);

        }

        this.textureUnits++;

        return textureUnits;

    }

    public bindTexture(target: number, texture: WebGLTexture): void {

        if (target === this.gl.TEXTURE_2D && this.texture2D !== texture) {

            this.gl.bindTexture(target, texture);
            this.texture2D = texture;

            return;

        }

        if (target === this.gl.TEXTURE_CUBE_MAP && this.textureCubeMap !== texture) {


            this.gl.bindTexture(target, texture);
            this.textureCubeMap = texture;

            return;

        }

    }

    public activeTexture(unit: number): void {

        if (this.textureUnit !== unit) {

            this.gl.activeTexture(this.gl.TEXTURE0 + unit);
            this.textureUnit = unit;

        }

    }

    public bindBuffer(target: number, buffer: WebGLBuffer): void {

        if (target === this.gl.ARRAY_BUFFER && this.arrayBuffer !== buffer) {

            this.arrayBuffer = buffer;
            this.gl.bindBuffer(target, buffer);

            return;

        }

        if (target === this.gl.ELEMENT_ARRAY_BUFFER && this.elementArrayBuffer !== buffer) {

            this.elementArrayBuffer = buffer;
            this.gl.bindBuffer(target, buffer);

            return;

        }

    }

    public bindVertexArray(vao: WebGLVertexArrayObject): void {

        if (this.vao !== vao) {

            this.vao = vao;
            this.gl.bindVertexArray(vao);

        }

    }

    public setFrontFace(isCW: boolean): void {

        if (this.frontFace !== isCW) {

            this.frontFace = isCW;
            this.gl.frontFace(isCW ? this.gl.CW : this.gl.CCW);

        }

    }

    public enable(id: number): void {

        if (!this.stateCache.get(id)) {

            this.gl.enable(id);
            this.stateCache.set(id, true);

        }

    }

    public disable(id: number): void {

        if (this.stateCache.get(id)) {

            this.gl.disable(id);
            this.stateCache.set(id, false);

        }

    }

    public depthTest(isEnable: boolean): void {

        if (isEnable) {

            this.enable(this.gl.DEPTH_TEST);

        } else {

            this.disable(this.gl.DEPTH_TEST);

        }

    }

    public backfaceCulling(isEnable: boolean): void {

        if (isEnable) {

            this.enable(this.gl.CULL_FACE);
            this.gl.cullFace(this.gl.BACK);

        } else {

            this.disable(this.gl.CULL_FACE);

        }

    }

}
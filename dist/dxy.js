class ColorHelper {
    static fromStyle(style) {
        let execArray;
        if (execArray = /^(\w+)\(([^\)]*)\)/.exec(style)) {
            return ColorHelper.fromRGB(execArray);
        }
        if (execArray = /^\#([A-Fa-f\d]+)$/.exec(style)) {
            return ColorHelper.fromHex(execArray);
        }
        return [0, 0, 0];
    }
    static fromRGB(array) {
        const name = array[1];
        const result = [0, 0, 0];
        if (name === 'rgb' || name === 'rgba') {
            const components = array[2];
            let color;
            if (color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
                result[0] = Math.min(255, parseInt(color[1], 10)) / 255;
                result[1] = Math.min(255, parseInt(color[2], 10)) / 255;
                result[2] = Math.min(255, parseInt(color[3], 10)) / 255;
            }
            if (color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
                result[0] = Math.min(100, parseInt(color[1], 10)) / 100;
                result[1] = Math.min(100, parseInt(color[2], 10)) / 100;
                result[2] = Math.min(100, parseInt(color[3], 10)) / 100;
            }
        }
        return result;
    }
    static fromHex(array) {
        const hex = array[1];
        const size = hex.length;
        const result = [0, 0, 0];
        if (size === 3) {
            result[0] = parseInt(hex.charAt(0), 16) / 15;
            result[1] = parseInt(hex.charAt(1), 16) / 15;
            result[2] = parseInt(hex.charAt(2), 16) / 15;
        }
        else if (size === 6) {
            const h = parseInt(hex, 16);
            result[0] = (h >> 16 & 255) / 255;
            result[1] = (h >> 8 & 255) / 255;
            result[2] = (h & 255) / 255;
        }
        return result;
    }
    static SRGBToLinear(c) {
        return (c < 0.04045) ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
    }
}
class Color {
    r;
    g;
    b;
    constructor(r = 1, g = 1, b = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    set(r, g, b) {
        this.r = ColorHelper.SRGBToLinear(r);
        this.g = ColorHelper.SRGBToLinear(g);
        this.b = ColorHelper.SRGBToLinear(b);
        return this;
    }
    setStyle(style) {
        const [r, g, b] = ColorHelper.fromStyle(style);
        this.set(r, g, b);
        return this;
    }
    copy(color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        return this;
    }
    setFromArray(array, offset = 0) {
        this.r = array[offset];
        this.g = array[offset + 1];
        this.b = array[offset + 2];
        return this;
    }
    multiplyScalar(scalar) {
        this.r *= scalar;
        this.g *= scalar;
        this.b *= scalar;
        return this;
    }
    toVector3(target) {
        target.x = this.r;
        target.y = this.g;
        target.z = this.b;
        return target;
    }
}

class EventObject {
    on(eventName, handler, scope) {
        if (!this.handlers) {
            this.handlers = new Map();
        }
        let handlers = this.handlers.get(eventName);
        if (!handlers) {
            handlers = new Map();
            this.handlers.set(eventName, handlers);
        }
        handlers.set(handler, scope);
    }
    off(eventName, handler) {
        if (!this.handlers) {
            return;
        }
        const handlers = this.handlers.get(eventName);
        if (handlers) {
            handlers.delete(handler);
        }
    }
    emit(eventName, parameters = {}) {
        if (!this.handlers) {
            return;
        }
        const handlers = this.handlers.get(eventName);
        if (handlers) {
            parameters.source = this;
            const entries = handlers.entries();
            for (const [handler, scope] of entries) {
                handler.call(scope, parameters);
            }
        }
    }
}

class Material extends EventObject {
    uniforms = {};
    name = '';
    transparent = false;
    backfaceCulling = true;
    vertexShader = '';
    fragmentShader = '';
    setUniform(name, value) {
        this.uniforms[name] = { value: value };
        return this;
    }
    getUniform(name) {
        return this.uniforms[name];
    }
    onBeforRender(scene, mesh, camera) { }
    dispose() {
        this.emit('dispose');
    }
}

var vertexShader$1 = "#version 300 es\r\n\r\nin vec3 position;\r\nin vec3 normal;\r\nin vec2 uv;\r\nin vec4 color;\r\n\r\nuniform mat3 normalMatrix;\r\nuniform mat4 modelViewMatrix;\r\nuniform mat4 projectionMatrix;\r\n\r\nout vec2 vUV;\r\nout vec3 vNormal;\r\nout vec3 vPosition;\r\nout vec4 vColor;\r\n\r\nvoid main() {\r\n\r\n    vUV = uv;\r\n    vColor = color;\r\n    vNormal = normalMatrix * normal;\r\n    vPosition = (modelViewMatrix * vec4(position, 1)).xyz;\r\n\r\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);\r\n\r\n}";

var fragmentShader$1 = "#version 300 es\r\n\r\nprecision highp float;\r\nprecision highp int;\r\n\r\nout vec4 oColor;\r\n\r\nin vec2 vUV;\r\nin vec3 vNormal;\r\nin vec3 vPosition;\r\nin vec4 vColor;\r\n\r\nuniform bool useUV;\r\nuniform bool useColor;\r\nuniform bool useNormal;\r\n\r\nuniform vec3 color;\r\nuniform float opacity;\r\n\r\nuniform sampler2D map;\r\nuniform bool useMap;\r\n\r\nuniform float roughness;\r\nuniform float metalness;\r\n\r\nuniform vec3 ambientLightColor;\r\n\r\nstruct DirectionalLight {\r\n\r\n    vec3 color;\r\n    vec3 direction;\r\n\r\n};\r\n\r\nuniform DirectionalLight directionalLight;\r\n\r\n#define RECIPROCAL_PI 0.3183098861837907\r\n#define EPSILON 1e-6\r\n\r\n#define saturate( a ) clamp( a, 0.0, 1.0 )\r\n\r\nfloat pow2(const in float x) {\r\n\r\n    return x * x;\r\n\r\n}\r\n\r\nvec3 BRDF_Lambert(const in vec3 diffuseColor) {\r\n\r\n    return RECIPROCAL_PI * diffuseColor;\r\n\r\n}\r\n\r\nvec3 F_Schlick(const in vec3 f0, const in float dotVH) {\r\n\r\n    float fresnel = exp2((-5.55473f * dotVH - 6.98316f) * dotVH);\r\n    return f0 * (1.0f - fresnel) + fresnel;\r\n\r\n}\r\n\r\nfloat D_GGX(const in float alpha, const in float dotNH) {\r\n\r\n    float a2 = pow2(alpha);\r\n\r\n    float denom = pow2(dotNH) * (a2 - 1.0f) + 1.0f;\r\n\r\n    return RECIPROCAL_PI * a2 / pow2(denom);\r\n\r\n}\r\n\r\nfloat V_GGX_SmithCorrelated(const in float alpha, const in float dotNL, const in float dotNV) {\r\n\r\n    float a2 = pow2(alpha);\r\n\r\n    float gv = dotNL * sqrt(a2 + (1.0f - a2) * pow2(dotNV));\r\n    float gl = dotNV * sqrt(a2 + (1.0f - a2) * pow2(dotNL));\r\n\r\n    return 0.5f / max(gv + gl, EPSILON);\r\n\r\n}\r\n\r\nvec3 BRDF_GGX(const in vec3 L, const in vec3 V, const in vec3 N, const in vec3 f0, const in float roughness) {\r\n\r\n    float alpha = pow2(roughness);\r\n\r\n    vec3 H = normalize(L + V);\r\n\r\n    float dotNL = saturate(dot(N, L));\r\n    float dotNV = saturate(dot(N, V));\r\n    float dotNH = saturate(dot(N, H));\r\n    float dotVH = saturate(dot(V, H));\r\n\r\n    vec3 F = F_Schlick(f0, dotVH);\r\n\r\n    float D = D_GGX(alpha, dotNH);\r\n    float G = V_GGX_SmithCorrelated(alpha, dotNL, dotNV);\r\n\r\n    return F * (G * D);\r\n\r\n}\r\n\r\nvec3 PBR(const in vec3 materialColor) {\r\n\r\n    vec3 N = normalize(vNormal);\r\n    vec3 V = normalize(-vPosition);\r\n    vec3 L = normalize(directionalLight.direction);\r\n\r\n    float geometryRoughness = max(roughness, 0.0525f);\r\n\r\n    // 叠加表面梯度\r\n    vec3 dxy = max(abs(dFdx(N)), abs(dFdy(N)));\r\n    float gradient = max(max(dxy.x, dxy.y), dxy.z);\r\n    geometryRoughness = min(geometryRoughness + gradient, 1.0f);\r\n\r\n    // 材质的漫反射基础色\r\n    vec3 diffuseColor = materialColor * (1.0f - metalness);\r\n\r\n    // 材质的镜面反射基础色\r\n    vec3 specularColor = mix(vec3(0.04f), materialColor, metalness);\r\n\r\n    // 来自灯光的辐照度 - 直接辐照度\r\n    vec3 lightIrradiance = directionalLight.color * saturate(dot(N, L));\r\n\r\n    // 来自灯光的漫反射 - 直接漫反射\r\n    vec3 lightDiffuse = lightIrradiance * BRDF_Lambert(diffuseColor);\r\n\r\n    // 来自灯光的镜面反射 - 直接镜面反射\r\n    vec3 lightSpecular = lightIrradiance * BRDF_GGX(L, V, N, specularColor, geometryRoughness);\r\n\r\n    // 来自环境的辐照度 = 环境光 + IBL - 间接辐照度\r\n    vec3 ambientIrradiance = ambientLightColor;\r\n\r\n    // 来自环境的漫反射 - 间接漫反射\r\n    vec3 ambientDiffuse = ambientIrradiance * BRDF_Lambert(diffuseColor);\r\n\r\n    // 最终颜色 = 直接漫反射 + 直接镜面反射 + 间接漫反射 + 间接镜面反射\r\n    return lightDiffuse + lightSpecular + ambientDiffuse;\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n    vec4 finalColor = vec4(color, opacity);\r\n\r\n    if(useMap && useUV) {\r\n\r\n        finalColor *= texture(map, vUV);\r\n\r\n    }\r\n\r\n    if(useColor) {\r\n\r\n        finalColor *= vColor;\r\n\r\n    }\r\n\r\n    if(useNormal) {\r\n\r\n        finalColor.rgb = PBR(finalColor.rgb);\r\n\r\n    } else {\r\n\r\n        finalColor.rgb *= ambientLightColor;\r\n\r\n    }\r\n\r\n    // linear sRGB 转换到 sRGB\r\n\r\n    vec3 greater = pow(finalColor.rgb, vec3(0.41666f)) * 1.055f - vec3(0.055f);\r\n    vec3 lessAndEqual = finalColor.rgb * 12.92f;\r\n    vec3 flag = vec3(lessThanEqual(finalColor.rgb, vec3(0.0031308f)));\r\n\r\n    oColor.rgb = mix(greater, lessAndEqual, flag);\r\n    oColor.a = finalColor.a;\r\n\r\n}\r\n";

class Vector3 {
    x;
    y;
    z;
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }
    setScalar(scalar) {
        this.x = scalar;
        this.y = scalar;
        this.z = scalar;
        return this;
    }
    setFromArray(array, offset = 0) {
        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        return this;
    }
    setFromMatrix4(m) {
        this.x = m.elements[12];
        this.y = m.elements[13];
        this.z = m.elements[14];
        return this;
    }
    add(right) {
        this.x += right.x;
        this.y += right.y;
        this.z += right.z;
        return this;
    }
    sub(v) {
        return this.subVectors(this, v);
    }
    subVectors(l, r) {
        this.x = l.x - r.x;
        this.y = l.y - r.y;
        this.z = l.z - r.z;
        return this;
    }
    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }
    applyMatrix3(m) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const me = m.elements;
        this.x = x * me[0] + y * me[3] + z * me[6];
        this.y = x * me[1] + y * me[4] + z * me[7];
        this.z = x * me[2] + y * me[5] + z * me[8];
        return this;
    }
    applyMatrix4(m) {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const e = m.elements;
        const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
        this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
        this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
        this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
        return this;
    }
    equals(v) {
        return v.x === this.x && v.y === this.y && v.z === this.z;
    }
    crossVectors(l, r) {
        this.x = l.y * r.z - l.z * r.y;
        this.y = l.z * r.x - l.x * r.z;
        this.z = l.x * r.y - l.y * r.x;
        return this;
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    length() {
        return Math.sqrt(this.lengthSq());
    }
    normalize() {
        return this.multiplyScalar(1 / (this.length() || 1));
    }
    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}

let Instances$2 = class Instances {
    static up = new Vector3(0, 1, 0);
    static x = new Vector3(0, 1, 0);
    static y = new Vector3(0, 1, 0);
    static z = new Vector3(0, 1, 0);
};
class Matrix4 {
    elements;
    constructor(elements = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]) {
        this.elements = elements;
    }
    set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
        this.elements[0] = n11;
        this.elements[1] = n12;
        this.elements[2] = n13;
        this.elements[3] = n14;
        this.elements[4] = n21;
        this.elements[5] = n22;
        this.elements[6] = n23;
        this.elements[7] = n24;
        this.elements[8] = n31;
        this.elements[9] = n32;
        this.elements[10] = n33;
        this.elements[11] = n34;
        this.elements[12] = n41;
        this.elements[13] = n42;
        this.elements[14] = n43;
        this.elements[15] = n44;
        return this;
    }
    copy(m) {
        this.elements.length = 0;
        this.elements.push(...m.elements);
        return this;
    }
    multiply(right) {
        return this.multiplyMatrices(this, right);
    }
    multiplyMatrices(left, right) {
        const le = left.elements.slice();
        const re = right.elements.slice();
        this.elements[0] = le[0] * re[0] + le[1] * re[4] + le[2] * re[8] + le[3] * re[12];
        this.elements[1] = le[0] * re[1] + le[1] * re[5] + le[2] * re[9] + le[3] * re[13];
        this.elements[2] = le[0] * re[2] + le[1] * re[6] + le[2] * re[10] + le[3] * re[14];
        this.elements[3] = le[0] * re[3] + le[1] * re[7] + le[2] * re[11] + le[3] * re[15];
        this.elements[4] = le[4] * re[0] + le[5] * re[4] + le[6] * re[8] + le[7] * re[12];
        this.elements[5] = le[4] * re[1] + le[5] * re[5] + le[6] * re[9] + le[7] * re[13];
        this.elements[6] = le[4] * re[2] + le[5] * re[6] + le[6] * re[10] + le[7] * re[14];
        this.elements[7] = le[4] * re[3] + le[5] * re[7] + le[6] * re[11] + le[7] * re[15];
        this.elements[8] = le[8] * re[0] + le[9] * re[4] + le[10] * re[8] + le[11] * re[12];
        this.elements[9] = le[8] * re[1] + le[9] * re[5] + le[10] * re[9] + le[11] * re[13];
        this.elements[10] = le[8] * re[2] + le[9] * re[6] + le[10] * re[10] + le[11] * re[14];
        this.elements[11] = le[8] * re[3] + le[9] * re[7] + le[10] * re[11] + le[11] * re[15];
        this.elements[12] = le[12] * re[0] + le[13] * re[4] + le[14] * re[8] + le[15] * re[12];
        this.elements[13] = le[12] * re[1] + le[13] * re[5] + le[14] * re[9] + le[15] * re[13];
        this.elements[14] = le[12] * re[2] + le[13] * re[6] + le[14] * re[10] + le[15] * re[14];
        this.elements[15] = le[12] * re[3] + le[13] * re[7] + le[14] * re[11] + le[15] * re[15];
        return this;
    }
    compose(position, rotation, scale) {
        const te = this.elements;
        const x = rotation.x;
        const y = rotation.y;
        const z = rotation.z;
        const w = rotation.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        const sx = scale.x;
        const sy = scale.y;
        const sz = scale.z;
        te[0] = (1 - (yy + zz)) * sx;
        te[1] = (xy + wz) * sx;
        te[2] = (xz - wy) * sx;
        te[3] = 0;
        te[4] = (xy - wz) * sy;
        te[5] = (1 - (xx + zz)) * sy;
        te[6] = (yz + wx) * sy;
        te[7] = 0;
        te[8] = (xz + wy) * sz;
        te[9] = (yz - wx) * sz;
        te[10] = (1 - (xx + yy)) * sz;
        te[11] = 0;
        te[12] = position.x;
        te[13] = position.y;
        te[14] = position.z;
        te[15] = 1;
        return this;
    }
    invert() {
        const te = this.elements;
        const n11 = te[0], n12 = te[1], n13 = te[2], n14 = te[3];
        const n21 = te[4], n22 = te[5], n23 = te[6], n24 = te[7];
        const n31 = te[8], n32 = te[9], n33 = te[10], n34 = te[11];
        const n41 = te[12], n42 = te[13], n43 = te[14], n44 = te[15];
        const t11 = n32 * n43 * n24 - n42 * n33 * n24 + n42 * n23 * n34 - n22 * n43 * n34 - n32 * n23 * n44 + n22 * n33 * n44;
        const t12 = n41 * n33 * n24 - n31 * n43 * n24 - n41 * n23 * n34 + n21 * n43 * n34 + n31 * n23 * n44 - n21 * n33 * n44;
        const t13 = n31 * n42 * n24 - n41 * n32 * n24 + n41 * n22 * n34 - n21 * n42 * n34 - n31 * n22 * n44 + n21 * n32 * n44;
        const t14 = n41 * n32 * n23 - n31 * n42 * n23 - n41 * n22 * n33 + n21 * n42 * n33 + n31 * n22 * n43 - n21 * n32 * n43;
        const det = n11 * t11 + n12 * t12 + n13 * t13 + n14 * t14;
        if (det === 0)
            return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        const detInv = 1 / det;
        te[0] = t11 * detInv;
        te[1] = (n42 * n33 * n14 - n32 * n43 * n14 - n42 * n13 * n34 + n12 * n43 * n34 + n32 * n13 * n44 - n12 * n33 * n44) * detInv;
        te[2] = (n22 * n43 * n14 - n42 * n23 * n14 + n42 * n13 * n24 - n12 * n43 * n24 - n22 * n13 * n44 + n12 * n23 * n44) * detInv;
        te[3] = (n32 * n23 * n14 - n22 * n33 * n14 - n32 * n13 * n24 + n12 * n33 * n24 + n22 * n13 * n34 - n12 * n23 * n34) * detInv;
        te[4] = t12 * detInv;
        te[5] = (n31 * n43 * n14 - n41 * n33 * n14 + n41 * n13 * n34 - n11 * n43 * n34 - n31 * n13 * n44 + n11 * n33 * n44) * detInv;
        te[6] = (n41 * n23 * n14 - n21 * n43 * n14 - n41 * n13 * n24 + n11 * n43 * n24 + n21 * n13 * n44 - n11 * n23 * n44) * detInv;
        te[7] = (n21 * n33 * n14 - n31 * n23 * n14 + n31 * n13 * n24 - n11 * n33 * n24 - n21 * n13 * n34 + n11 * n23 * n34) * detInv;
        te[8] = t13 * detInv;
        te[9] = (n41 * n32 * n14 - n31 * n42 * n14 - n41 * n12 * n34 + n11 * n42 * n34 + n31 * n12 * n44 - n11 * n32 * n44) * detInv;
        te[10] = (n21 * n42 * n14 - n41 * n22 * n14 + n41 * n12 * n24 - n11 * n42 * n24 - n21 * n12 * n44 + n11 * n22 * n44) * detInv;
        te[11] = (n31 * n22 * n14 - n21 * n32 * n14 - n31 * n12 * n24 + n11 * n32 * n24 + n21 * n12 * n34 - n11 * n22 * n34) * detInv;
        te[12] = t14 * detInv;
        te[13] = (n31 * n42 * n13 - n41 * n32 * n13 + n41 * n12 * n33 - n11 * n42 * n33 - n31 * n12 * n43 + n11 * n32 * n43) * detInv;
        te[14] = (n41 * n22 * n13 - n21 * n42 * n13 - n41 * n12 * n23 + n11 * n42 * n23 + n21 * n12 * n43 - n11 * n22 * n43) * detInv;
        te[15] = (n21 * n32 * n13 - n31 * n22 * n13 + n31 * n12 * n23 - n11 * n32 * n23 - n21 * n12 * n33 + n11 * n22 * n33) * detInv;
        return this;
    }
    determinant() {
        const te = this.elements;
        const n11 = te[0], n21 = te[1], n31 = te[2], n41 = te[3];
        const n12 = te[4], n22 = te[5], n32 = te[6], n42 = te[7];
        const n13 = te[8], n23 = te[9], n33 = te[10], n43 = te[11];
        const n14 = te[12], n24 = te[13], n34 = te[14], n44 = te[15];
        return (n41 * (+n14 * n23 * n32 -
            n13 * n24 * n32 -
            n14 * n22 * n33 +
            n12 * n24 * n33 +
            n13 * n22 * n34 -
            n12 * n23 * n34)
            +
                n42 * (+n11 * n23 * n34 -
                    n11 * n24 * n33 +
                    n14 * n21 * n33 -
                    n13 * n21 * n34 +
                    n13 * n24 * n31 -
                    n14 * n23 * n31)
            +
                n43 * (+n11 * n24 * n32 -
                    n11 * n22 * n34 -
                    n14 * n21 * n32 +
                    n12 * n21 * n34 +
                    n14 * n22 * n31 -
                    n12 * n24 * n31)
            +
                n44 * (-n13 * n22 * n31 -
                    n11 * n23 * n32 +
                    n11 * n22 * n33 +
                    n13 * n21 * n32 -
                    n12 * n21 * n33 +
                    n12 * n23 * n31));
    }
    makePerspective(left, right, top, bottom, near, far) {
        const te = this.elements;
        const x = (2 * near) / (right - left);
        const y = (2 * near) / (top - bottom);
        const a = (right + left) / (right - left);
        const b = (top + bottom) / (top - bottom);
        const c = -(far + near) / (far - near);
        const d = (-2 * far * near) / (far - near);
        te[0] = x, te[1] = 0, te[2] = 0, te[3] = 0;
        te[4] = 0, te[5] = y, te[6] = 0, te[7] = 0;
        te[8] = a, te[9] = b, te[10] = c, te[11] = -1;
        te[12] = 0, te[13] = 0, te[14] = d, te[15] = 0;
        return this;
    }
    makeLookAt(eye, target) {
        Instances$2.z.subVectors(eye, target);
        if (!Instances$2.z.length()) {
            Instances$2.z.z = 1;
        }
        Instances$2.z.normalize();
        Instances$2.x.crossVectors(Instances$2.up, Instances$2.z);
        if (!Instances$2.x.lengthSq()) {
            Instances$2.z.z += 0.0001;
            Instances$2.z.normalize();
            Instances$2.x.crossVectors(Instances$2.up, Instances$2.z);
        }
        Instances$2.x.normalize();
        Instances$2.y.crossVectors(Instances$2.z, Instances$2.x);
        this.elements[0] = Instances$2.x.x;
        this.elements[1] = Instances$2.x.y;
        this.elements[2] = Instances$2.x.z;
        this.elements[4] = Instances$2.y.x;
        this.elements[5] = Instances$2.y.y;
        this.elements[6] = Instances$2.y.z;
        this.elements[8] = Instances$2.z.x;
        this.elements[9] = Instances$2.z.y;
        this.elements[10] = Instances$2.z.z;
        return this;
    }
    equals(m) {
        const te = this.elements;
        const me = m.elements;
        for (let ii = 0; ii < 16; ii++) {
            if (te[ii] !== me[ii]) {
                return false;
            }
        }
        return true;
    }
}

class Matrix3 {
    elements;
    constructor(elements = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
    ]) {
        this.elements = elements;
    }
    set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
        this.elements[0] = n11;
        this.elements[1] = n12;
        this.elements[2] = n13;
        this.elements[3] = n21;
        this.elements[4] = n22;
        this.elements[5] = n23;
        this.elements[6] = n31;
        this.elements[7] = n32;
        this.elements[8] = n33;
        return this;
    }
    copy(m) {
        this.elements.length = 0;
        this.elements.push(...m.elements);
        return this;
    }
    setFromMatrix4(m) {
        this.elements[0] = m.elements[0];
        this.elements[1] = m.elements[1];
        this.elements[2] = m.elements[2];
        this.elements[3] = m.elements[4];
        this.elements[4] = m.elements[5];
        this.elements[5] = m.elements[6];
        this.elements[6] = m.elements[8];
        this.elements[7] = m.elements[9];
        this.elements[8] = m.elements[10];
        return this;
    }
    invert() {
        const te = this.elements;
        const n11 = te[0], n12 = te[1], n13 = te[2];
        const n21 = te[3], n22 = te[4], n23 = te[5];
        const n31 = te[6], n32 = te[7], n33 = te[8];
        const t11 = n33 * n22 - n23 * n32;
        const t12 = n23 * n31 - n33 * n21;
        const t13 = n32 * n21 - n22 * n31;
        const det = n11 * t11 + n12 * t12 + n13 * t13;
        if (det === 0) {
            return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
        const detInv = 1 / det;
        te[0] = t11 * detInv;
        te[1] = (n13 * n32 - n33 * n12) * detInv;
        te[2] = (n23 * n12 - n13 * n22) * detInv;
        te[3] = t12 * detInv;
        te[4] = (n33 * n11 - n13 * n31) * detInv;
        te[5] = (n13 * n21 - n23 * n11) * detInv;
        te[6] = t13 * detInv;
        te[7] = (n12 * n31 - n32 * n11) * detInv;
        te[8] = (n22 * n11 - n12 * n21) * detInv;
        return this;
    }
    transpose() {
        this.set(this.elements[0], this.elements[3], this.elements[6], this.elements[1], this.elements[4], this.elements[7], this.elements[2], this.elements[5], this.elements[8]);
        return this;
    }
    makeNormalMatrix(matrix4) {
        return this.setFromMatrix4(matrix4).invert().transpose();
    }
    equals(m) {
        const te = this.elements;
        const me = m.elements;
        for (let ii = 0; ii < 9; ii++) {
            if (te[ii] !== me[ii]) {
                return false;
            }
        }
        return true;
    }
}

class PhysMaterial extends Material {
    opacity = 1;
    color = new Color(1, 1, 1);
    map;
    roughness = 1;
    roughnessMap;
    metalness = 0;
    metalnessMap;
    constructor() {
        super();
        this.vertexShader = vertexShader$1;
        this.fragmentShader = fragmentShader$1;
        this.initUniforms();
    }
    initUniforms() {
        this.setUniform('color', new Color());
        this.setUniform('opacity', 1);
        this.setUniform('map', undefined);
        this.setUniform('useMap', false);
        this.setUniform('roughness', 1);
        this.setUniform('roughnessMap', undefined);
        this.setUniform('useRoughnessMap', false);
        this.setUniform('metalness', 0);
        this.setUniform('metalnessMap', undefined);
        this.setUniform('useMetalnessMap', false);
        this.setUniform('modelViewMatrix', new Matrix4());
        this.setUniform('normalMatrix', new Matrix3());
        this.setUniform('projectionMatrix', new Matrix4());
        this.setUniform('useNormal', false);
        this.setUniform('useUV', false);
        this.setUniform('useColor', false);
        this.setUniform('ambientLightColor', new Color());
        this.setUniform('directionalLight', {
            color: new Color(),
            direction: new Vector3(),
        });
    }
    onBeforRender(scene, mesh, camera) {
        this.uniforms.opacity.value = this.opacity;
        this.uniforms.color.value.copy(this.color);
        this.uniforms.map.value = this.map;
        this.uniforms.useMap.value = !!this.map;
        this.uniforms.roughness.value = this.roughness;
        this.uniforms.roughnessMap.value = this.roughnessMap;
        this.uniforms.useRoughnessMap.value = !!this.roughnessMap;
        this.uniforms.metalness.value = this.metalness;
        this.uniforms.metalnessMap.value = this.metalnessMap;
        this.uniforms.useMetalnessMap.value = !!this.metalnessMap;
        this.uniforms.modelViewMatrix.value.copy(mesh.modelViewMatrix);
        this.uniforms.normalMatrix.value.copy(mesh.normalMatrix);
        this.uniforms.projectionMatrix.value.copy(camera.projectionMatrix);
        this.uniforms.useNormal.value = mesh.geometry.hasAttribute('normal');
        this.uniforms.useUV.value = mesh.geometry.hasAttribute('uv');
        this.uniforms.useColor.value = mesh.geometry.hasAttribute('color');
        this.uniforms.ambientLightColor.value.copy(scene.ambientLight.color);
        this.uniforms.directionalLight.value.color.copy(scene.directionalLight.color);
        this.uniforms.directionalLight.value.direction.copy(scene.directionalLight.direction);
    }
    dispose() {
        super.emit('dispose');
    }
}

class WebGLConstants {
    static BYTE = 5120;
    static UNSIGNED_BYTE = 5121;
    static SHORT = 5122;
    static UNSIGNED_SHORT = 5123;
    static INT = 5124;
    static UNSIGNED_INT = 5125;
    static FLOAT = 5126;
    static BOOL = 35670;
    static FLOAT_VEC2 = 35664;
    static INT_VEC2 = 35667;
    static BOOL_VEC2 = 35671;
    static FLOAT_VEC3 = 35665;
    static INT_VEC3 = 35668;
    static BOOL_VEC3 = 35672;
    static FLOAT_VEC4 = 35666;
    static INT_VEC4 = 35669;
    static BOOL_VEC4 = 35673;
    static FLOAT_MAT3 = 35675;
    static FLOAT_MAT4 = 35676;
    static SAMPLER_2D = 35678;
    static POINTS = 0;
    static LINES = 1;
    static TRIANGLES = 4;
    static TEXTURE_2D = 3553;
    static ARRAY_BUFFER = 34962;
    static ELEMENT_ARRAY_BUFFER = 34963;
    static STATIC_DRAW = 35044;
    static NEAREST = 9728;
    static LINEAR = 9729;
    static NEAREST_MIPMAP_NEAREST = 9984;
    static LINEAR_MIPMAP_NEAREST = 9985;
    static NEAREST_MIPMAP_LINEAR = 9986;
    static LINEAR_MIPMAP_LINEAR = 9987;
    static REPEAT = 10497;
    static CLAMP_TO_EDGE = 33071;
    static MIRRORED_REPEAT = 33648;
}

class AttributeHelper {
    static getGLType(constructor) {
        if (constructor === Int8Array) {
            return WebGLConstants.BYTE;
        }
        if (constructor === Uint8Array) {
            return WebGLConstants.UNSIGNED_BYTE;
        }
        if (constructor === Int16Array) {
            return WebGLConstants.SHORT;
        }
        if (constructor === Uint16Array) {
            return WebGLConstants.UNSIGNED_SHORT;
        }
        if (constructor === Uint32Array) {
            return WebGLConstants.UNSIGNED_INT;
        }
        if (constructor === Float32Array) {
            return WebGLConstants.FLOAT;
        }
        return WebGLConstants.FLOAT;
    }
}
class Attribute extends EventObject {
    array;
    itemSize;
    normalized;
    dataType;
    dataUsage = WebGLConstants.STATIC_DRAW;
    needsUpdate = false;
    constructor(array, itemSize, normalized = false) {
        super();
        this.array = array;
        this.itemSize = itemSize;
        this.normalized = normalized;
        this.dataType = AttributeHelper.getGLType(array.constructor);
    }
    get count() {
        return this.array.length / this.itemSize;
    }
    getX(index) {
        return this.array[index * this.itemSize];
    }
}

class GeometryHelper {
    static arrayNeedsUint32(array) {
        for (let ii = array.length - 1; ii >= 0; --ii) {
            if (array[ii] >= 65535) {
                return true;
            }
        }
        return false;
    }
}
class Geometry extends EventObject {
    attributes = {};
    groups = [];
    indices;
    get position() {
        return this.getAttribute('position');
    }
    setIndices(array) {
        if (GeometryHelper.arrayNeedsUint32(array)) {
            this.indices = new Attribute(new Uint32Array(array), 1);
        }
        else {
            this.indices = new Attribute(new Uint16Array(array), 1);
        }
    }
    setAttribute(name, attribute) {
        this.attributes[name] = attribute;
        return this;
    }
    getAttribute(name) {
        return this.attributes[name];
    }
    hasAttribute(name) {
        return name in this.attributes;
    }
    addGroup(start, count, materialIndex) {
        this.groups.push({
            start: start,
            count: count,
            materialIndex: materialIndex
        });
        return this;
    }
    dispose() {
        this.emit('dispose');
    }
}

class Texture extends EventObject {
    image;
    magFilter = WebGLConstants.LINEAR;
    minFilter = WebGLConstants.LINEAR_MIPMAP_LINEAR;
    wrapS = WebGLConstants.REPEAT;
    wrapT = WebGLConstants.REPEAT;
    needsUpdate = false;
    constructor(image) {
        super();
        this.image = image;
    }
    dispose() {
        this.emit('dispose');
    }
}
class CubeTexture extends Texture {
    images;
    constructor(images) {
        super();
        this.images = images;
    }
}

class Quaternion {
    x;
    y;
    z;
    w;
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    setFromArray(array, offset = 0) {
        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        this.w = array[offset + 3];
        return this;
    }
    setFromMatrix4(m) {
        const me = m.elements;
        const trace = me[0] + me[5] + me[10];
        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);
            this.w = 0.25 / s;
            this.x = (me[6] - me[9]) * s;
            this.y = (me[8] - me[2]) * s;
            this.z = (me[1] - me[4]) * s;
        }
        else if (me[0] > me[5] && me[0] > me[10]) {
            const s = 2.0 * Math.sqrt(1.0 + me[0] - me[5] - me[10]);
            this.w = (me[6] - me[9]) / s;
            this.x = 0.25 * s;
            this.y = (me[4] + me[1]) / s;
            this.z = (me[8] + me[2]) / s;
        }
        else if (me[5] > me[10]) {
            const s = 2.0 * Math.sqrt(1.0 + me[5] - me[0] - me[10]);
            this.w = (me[8] - me[2]) / s;
            this.x = (me[4] + me[1]) / s;
            this.y = 0.25 * s;
            this.z = (me[9] + me[6]) / s;
        }
        else {
            const s = 2.0 * Math.sqrt(1.0 + me[10] - me[0] - me[5]);
            this.w = (me[1] - me[4]) / s;
            this.x = (me[8] + me[2]) / s;
            this.y = (me[9] + me[6]) / s;
            this.z = 0.25 * s;
        }
        return this;
    }
    setFromEuler(x, y, z) {
        const c1 = Math.cos(x / 2);
        const c2 = Math.cos(y / 2);
        const c3 = Math.cos(z / 2);
        const s1 = Math.sin(x / 2);
        const s2 = Math.sin(y / 2);
        const s3 = Math.sin(z / 2);
        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;
        return this;
    }
}

class TRSObject extends EventObject {
    name = '';
    position = new Vector3(0, 0, 0);
    rotation = new Quaternion(0, 0, 0, 1);
    scale = new Vector3(1, 1, 1);
    matrix = new Matrix4();
    modelMatrix = new Matrix4();
    parent;
    children = [];
    visible = true;
    updateMatrix(updateParents, updateChildren) {
        if (updateParents && this.parent) {
            this.parent.updateMatrix(true, false);
        }
        this.matrix.compose(this.position, this.rotation, this.scale);
        this.modelMatrix.copy(this.matrix);
        if (this.parent) {
            this.modelMatrix.multiply(this.parent.modelMatrix);
        }
        if (updateChildren) {
            for (const child of this.children) {
                child.updateMatrix(false, true);
            }
        }
    }
    add(object) {
        if (object !== this) {
            if (object.parent) {
                object.parent.remove(object);
            }
            object.parent = this;
            this.children.push(object);
        }
        return this;
    }
    remove(object) {
        if (object !== this) {
            const index = this.children.indexOf(object);
            if (index !== -1) {
                object.parent = undefined;
                this.children.splice(index, 1);
            }
        }
        return this;
    }
    dispose() {
        this.emit('dispose');
    }
}

class Mesh extends TRSObject {
    geometry;
    material;
    normalMatrix = new Matrix3();
    modelViewMatrix = new Matrix4();
    constructor(geometry = new Geometry(), material = new PhysMaterial()) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
    updateModelViewMatrix(viewMatrix) {
        this.modelViewMatrix.multiplyMatrices(this.modelMatrix, viewMatrix);
        this.normalMatrix.makeNormalMatrix(this.modelViewMatrix);
    }
    dispose() {
        this.geometry && this.geometry.dispose();
        if (this.material) {
            if (Array.isArray(this.material)) {
                for (const material of this.material) {
                    material.dispose();
                }
            }
            else {
                this.material.dispose();
            }
        }
    }
}

class GLBHelper {
    static textDecoder = new TextDecoder();
    static material = new PhysMaterial();
    static filterMapping = new Map([
        [9728, WebGLConstants.NEAREST],
        [9729, WebGLConstants.LINEAR],
        [9984, WebGLConstants.NEAREST_MIPMAP_NEAREST],
        [9985, WebGLConstants.LINEAR_MIPMAP_NEAREST],
        [9986, WebGLConstants.NEAREST_MIPMAP_LINEAR],
        [9987, WebGLConstants.LINEAR_MIPMAP_LINEAR],
    ]);
    static wrapMapping = new Map([
        [10497, WebGLConstants.REPEAT],
        [33071, WebGLConstants.CLAMP_TO_EDGE],
        [33648, WebGLConstants.MIRRORED_REPEAT],
    ]);
    static sizeMapping = new Map([
        ['SCALAR', 1],
        ['VEC2', 2],
        ['VEC3', 3],
        ['VEC4', 4],
        ['MAT2', 2],
        ['MAT3', 9],
        ['MAT4', 16],
    ]);
    static getGeometryKey(primitive = {}) {
        const geometryKey = [`indices:${primitive.indices};`];
        for (const key in primitive.attributes) {
            const index = primitive.attributes[key];
            geometryKey.push(`${key}:${index};`);
        }
        geometryKey.push(`mode:${primitive.mode};`);
        return geometryKey.join();
    }
    static getAttributeName(name) {
        switch (name) {
            case 'POSITION': return 'position';
            case 'NORMAL': return 'normal';
            case 'TANGENT': return 'tangent';
            case 'TEXCOORD_0': return 'uv';
            case 'TEXCOORD_1': return 'uv2';
            case 'COLOR_0': return 'color';
            case 'WEIGHTS_0': return 'skinWeight';
            case 'JOINTS_0': return 'skinIndex';
            default: return name.toLowerCase();
        }
    }
    static createTypedArray(type, lenOrBuf, offset, length) {
        let constructor;
        switch (type) {
            case 5120:
                constructor = ArrayBuffer;
                break;
            case 5121:
                constructor = Uint8Array;
                break;
            case 5122:
                constructor = Int16Array;
                break;
            case 5123:
                constructor = Uint16Array;
                break;
            case 5125:
                constructor = Uint32Array;
                break;
            case 5126:
            default:
                constructor = Float32Array;
        }
        if (lenOrBuf instanceof ArrayBuffer) {
            return new constructor(lenOrBuf, offset, length);
        }
        else {
            return new constructor(lenOrBuf);
        }
    }
    static mergeGeometries(geometries) {
        const merge = new Geometry();
        if (!geometries.length) {
            return merge;
        }
        const usedNames = Object.keys(geometries[0].attributes);
        if (!usedNames.length) {
            return merge;
        }
        const usedIndices = geometries[0].indices !== undefined;
        const allAttributes = [];
        let startIndex = 0;
        for (let ii = 0, li = geometries.length; ii < li; ii++) {
            const geometry = geometries[ii];
            const attributes = [];
            if (usedIndices) {
                if (!geometry.indices) {
                    console.warn(`Dxy.GLBLoader : ${ii} 个几何体缺少索引数据 . `);
                    continue;
                }
                attributes.push(geometry.indices);
            }
            let isBreak = false;
            for (const name of usedNames) {
                const attribute = geometry.getAttribute(name);
                if (!attribute) {
                    isBreak = true;
                    break;
                }
                attributes.push(attribute);
            }
            if (isBreak) {
                console.warn(`Dxy.GLBLoader : 第 ${ii} 个几何体缺少属性 . `);
                continue;
            }
            const count = attributes[0].count;
            merge.addGroup(startIndex, count, allAttributes.length);
            startIndex += count;
            allAttributes.push(attributes);
        }
        if (usedIndices) {
            const data = [];
            let offset = 0;
            for (const attributes of allAttributes) {
                const indices = attributes.shift();
                for (let ii = 0, li = indices.count; ii < li; ii++) {
                    data.push(indices.getX(ii) + offset);
                }
                offset += attributes[0].count;
            }
            merge.setIndices(data);
        }
        while (usedNames.length > 0) {
            const attributes = allAttributes.map(e => e.shift());
            const name = usedNames.shift();
            const attribute = GLBHelper.mergeAttributes(attributes);
            if (attribute) {
                merge.setAttribute(name, attribute);
            }
        }
        return merge;
    }
    static mergeAttributes(attributes) {
        if (attributes.length === 0) {
            return undefined;
        }
        const dataType = attributes[0].dataType;
        const itemSize = attributes[0].itemSize;
        const normalized = attributes[0].normalized;
        let arrayLen = 0;
        for (let ii = 0, li = attributes.length; ii < li; ii++) {
            const attribute = attributes[ii];
            if (attribute.dataType !== dataType ||
                attribute.itemSize !== itemSize ||
                attribute.normalized !== normalized) {
                console.warn(`Dxy.GLBLoader : 第 ${ii} 个缓冲属性类型错误 . `);
                return undefined;
            }
            arrayLen += attribute.array.length;
        }
        const array = GLBHelper.createTypedArray(dataType, arrayLen);
        let offset = 0;
        for (const attribute of attributes) {
            array.set(attribute.array, offset);
            offset += attribute.array.length;
        }
        return new Attribute(array, itemSize, normalized);
    }
}
class GBL {
    url;
    onLoad;
    objectDef;
    bufferData;
    geometryCache = new Map();
    constructor(url, onLoad) {
        this.url = url;
        this.onLoad = onLoad;
    }
    async parse() {
        await this.requestData();
        let scene;
        if (this.objectDef.scenes) {
            scene = await this.loadScene(this.objectDef.scene);
        }
        if (typeof this.onLoad === 'function') {
            this.onLoad(scene);
        }
        return scene;
    }
    async requestData() {
        const response = await fetch(this.url);
        const data = await response.arrayBuffer();
        const dataView = new DataView(data);
        const length = dataView.getUint32(8, true);
        let index = 12, chunkLength, chunkType;
        let objectDef, bufferData;
        while (index < length) {
            chunkLength = dataView.getUint32(index, true);
            index += 4;
            chunkType = dataView.getUint32(index, true);
            index += 4;
            if (chunkType === 0x4E4F534A) {
                const defData = new Uint8Array(data, index, chunkLength);
                objectDef = GLBHelper.textDecoder.decode(defData);
            }
            else if (chunkType === 0x004E4942) {
                bufferData = data.slice(index, index + chunkLength);
            }
            index += chunkLength;
        }
        this.objectDef = objectDef ? JSON.parse(objectDef) : {};
        this.bufferData = bufferData;
    }
    async loadScene(index) {
        const sceneDef = this.objectDef.scenes[index];
        const scene = new TRSObject();
        scene.name = sceneDef.name || '';
        for (const nodeIndex of sceneDef.nodes) {
            const node = await this.loadNode(nodeIndex);
            scene.add(node);
        }
        return scene;
    }
    async loadNode(index) {
        const nodeDef = this.objectDef.nodes[index];
        if (nodeDef.instance) {
            return nodeDef.instance;
        }
        let node;
        if (nodeDef.mesh !== undefined) {
            node = await this.loadMesh(nodeDef.mesh);
        }
        else {
            node = new TRSObject();
        }
        node.name = nodeDef.name || '';
        if (nodeDef.translation !== undefined) {
            node.position.setFromArray(nodeDef.translation);
        }
        if (nodeDef.rotation !== undefined) {
            node.rotation.setFromArray(nodeDef.rotation);
        }
        if (nodeDef.scale !== undefined) {
            node.scale.setFromArray(nodeDef.scale);
        }
        if (nodeDef.children !== undefined) {
            for (const childIndex of nodeDef.children) {
                const child = await this.loadNode(childIndex);
                node.add(child);
            }
        }
        nodeDef.instance = node;
        return node;
    }
    async loadMesh(index) {
        const meshDef = this.objectDef.meshes[index];
        if (meshDef.instance !== undefined) {
            return meshDef.instance;
        }
        const primitives = meshDef.primitives;
        const geometryKeys = [];
        const geometries = this.loadGeometries(primitives, geometryKeys);
        const materials = await this.loadMaterials(primitives);
        let mesh;
        if (geometries.length === 1) {
            mesh = new Mesh(geometries[0], materials[0]);
        }
        else {
            const key = geometryKeys.join('_');
            let geometry = this.geometryCache.get(key);
            if (!geometry) {
                geometry = GLBHelper.mergeGeometries(geometries);
                this.geometryCache.set(key, geometry);
            }
            mesh = new Mesh(geometry, materials);
        }
        meshDef.instance = mesh;
        return mesh;
    }
    loadGeometries(primitives, keys) {
        const geometries = [];
        let geometry;
        for (const primitive of primitives) {
            const key = GLBHelper.getGeometryKey(primitive);
            geometry = this.geometryCache.get(key);
            if (!geometry) {
                geometry = new Geometry();
                for (const key in primitive.attributes) {
                    const attributeName = GLBHelper.getAttributeName(key);
                    if (geometry.hasAttribute(attributeName)) {
                        continue;
                    }
                    const accessorIndex = primitive.attributes[key];
                    const attribute = this.loadAttribute(accessorIndex);
                    geometry.setAttribute(attributeName, attribute);
                }
                if (primitive.indices !== undefined) {
                    const attribute = this.loadAttribute(primitive.indices);
                    geometry.indices = attribute;
                }
                this.geometryCache.set(key, geometry);
            }
            keys.push(key);
            geometries.push(geometry);
        }
        return geometries;
    }
    loadAttribute(index) {
        const accessorDef = this.objectDef.accessors[index];
        const itemSize = GLBHelper.sizeMapping.get(accessorDef.type) || 0;
        const type = accessorDef.componentType;
        const count = accessorDef.count;
        const offset = accessorDef.byteOffset || 0;
        const normalized = accessorDef.normalized === true;
        const buffer = this.loadBufferView(accessorDef.bufferView);
        const typedArray = GLBHelper.createTypedArray(type, buffer, offset, count * itemSize);
        return new Attribute(typedArray, itemSize, normalized);
    }
    async loadMaterials(primitives) {
        const materials = [];
        for (const primitive of primitives) {
            if (primitive.material === undefined) {
                materials.push(GLBHelper.material);
                continue;
            }
            const materialDef = this.objectDef.materials[primitive.material];
            if (materialDef.instance) {
                materials.push(materialDef.instance);
                continue;
            }
            const material = new PhysMaterial();
            materialDef.instance = material;
            material.name = materialDef.name;
            const pbr = materialDef.pbrMetallicRoughness;
            if (Array.isArray(pbr.baseColorFactor)) {
                material.color.setFromArray(pbr.baseColorFactor);
                material.opacity = pbr.baseColorFactor[3];
            }
            if (pbr.baseColorTexture !== undefined) {
                const texture = await this.loadTexture(pbr.baseColorTexture.index);
                material.map = texture;
            }
            material.metalness = pbr.metallicFactor !== undefined ? pbr.metallicFactor : 1;
            material.roughness = pbr.roughnessFactor !== undefined ? pbr.roughnessFactor : 1;
            if (pbr.metallicRoughnessTexture !== undefined) {
                const texture = await this.loadTexture(pbr.metallicRoughnessTexture.index);
                material.metalnessMap = texture;
                material.roughnessMap = texture;
            }
            if (materialDef.normalTexture !== undefined) ;
            if (materialDef.occlusionTexture !== undefined) ;
            if (materialDef.emissiveFactor !== undefined) ;
            if (materialDef.extensions !== undefined) ;
            if (materialDef.emissiveTexture !== undefined) ;
            if (materialDef.doubleSided === true) {
                material.backfaceCulling = false;
            }
            if (materialDef.alphaMode === 'BLEND') ;
            materials.push(material);
        }
        return materials;
    }
    async loadTexture(index) {
        const textureDef = this.objectDef.textures[index];
        if (textureDef.instance) {
            return textureDef.instance;
        }
        const imageDef = this.objectDef.images[textureDef.source];
        if (!imageDef.instance) {
            const buffer = this.loadBufferView(imageDef.bufferView);
            const blob = new Blob([buffer], { type: imageDef.mimeType });
            imageDef.instance = await createImageBitmap(blob, { colorSpaceConversion: 'none' });
        }
        const texture = new Texture(imageDef.instance);
        textureDef.instance = texture;
        const samplerDef = this.objectDef.samplers[textureDef.sampler];
        texture.magFilter = GLBHelper.filterMapping.get(samplerDef.magFilter) || texture.magFilter;
        texture.minFilter = GLBHelper.filterMapping.get(samplerDef.minFilter) || texture.minFilter;
        texture.wrapS = GLBHelper.wrapMapping.get(samplerDef.wrapS) || texture.wrapS;
        texture.wrapT = GLBHelper.wrapMapping.get(samplerDef.wrapT) || texture.wrapT;
        return texture;
    }
    loadBufferView(index) {
        const bufferViewDef = this.objectDef.bufferViews[index];
        const byteLength = bufferViewDef.byteLength;
        const byteOffset = bufferViewDef.byteOffset || 0;
        if (this.bufferData) {
            return this.bufferData.slice(byteOffset, byteOffset + byteLength);
        }
        else {
            return new ArrayBuffer(byteLength);
        }
    }
}
class GLBLoader {
    static async load(url, onLoad) {
        return new GBL(url, onLoad).parse();
    }
}

class ImageLoader {
    static load(url, onLoad) {
        return new Promise(function (resolve, reject) {
            const image = document.createElement('img');
            image.onload = () => {
                onLoad && onLoad(image);
                resolve(image);
            };
            image.onerror = () => {
                onLoad && onLoad();
                reject();
            };
            image.src = url;
        });
    }
    static loadArray(urls, onLoad) {
        return new Promise(async function (resolve, reject) {
            const images = [];
            for (const url of urls) {
                const image = await ImageLoader.load(url);
                if (!image) {
                    onLoad && onLoad();
                    reject();
                }
                images.push(image);
            }
            onLoad && onLoad(images);
            resolve(images);
        });
    }
}

const EPS = 0.000001;
class Spherical {
    radius;
    phi;
    theta;
    constructor(radius = 1, phi = 0, theta = 0) {
        this.radius = radius;
        this.phi = phi;
        this.theta = theta;
    }
    setFromVector3(v) {
        this.radius = v.length();
        if (this.radius === 0) {
            this.theta = 0;
            this.phi = 0;
        }
        else {
            this.theta = Math.atan2(v.x, v.z);
            this.phi = Math.acos(v.y / this.radius);
        }
        return this;
    }
    toVector3(target) {
        const sinPhiRadius = Math.sin(this.phi) * this.radius;
        target.x = sinPhiRadius * Math.sin(this.theta);
        target.y = Math.cos(this.phi) * this.radius;
        target.z = sinPhiRadius * Math.cos(this.theta);
        return target;
    }
    makeSafe() {
        this.phi = Math.max(EPS, Math.min(this.phi, Math.PI - EPS));
        return this;
    }
}

class Vector2 {
    x;
    y;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    copy(v) {
        this.y = v.y;
        this.x = v.x;
        return this;
    }
    setScalar(scalar) {
        this.x = scalar;
        this.y = scalar;
        return this;
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    sub(v) {
        return this.subVectors(this, v);
    }
    subVectors(l, r) {
        this.x = l.x - r.x;
        this.y = l.y - r.y;
        return this;
    }
    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    equals(v) {
        return v.x === this.x && v.y === this.y;
    }
}

let Instances$1 = class Instances {
    static v3_1 = new Vector3();
    static v3_2 = new Vector3();
    static m3 = new Matrix3();
    static m4 = new Matrix4();
    static sph = new Spherical();
};
class Controls {
    camera;
    canvas;
    dispose;
    state = 'none';
    rotateStart = new Vector2();
    rotateEnd = new Vector2();
    rotateDelta = new Vector2();
    panStart = new Vector2();
    panEnd = new Vector2();
    panOffset = new Vector3();
    zoom = 1;
    constructor(camera, canvas) {
        this.camera = camera;
        this.canvas = canvas;
        const onContextMenu = this.onContextMenu.bind(this);
        const onPointerDown = this.onPointerDown.bind(this);
        const onPointerMove = this.onPointerMove.bind(this);
        const onPointerUp = this.onPointerUp.bind(this);
        const onMouseWheel = this.onMouseWheel.bind(this);
        canvas.addEventListener('contextmenu', onContextMenu);
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointercancel', onPointerUp);
        canvas.addEventListener('wheel', onMouseWheel, { passive: false });
        this.dispose = function () {
            canvas.removeEventListener('contextmenu', onContextMenu);
            canvas.removeEventListener('pointerdown', onPointerDown);
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('pointerup', onPointerUp);
            canvas.removeEventListener('pointercancel', onPointerUp);
            canvas.removeEventListener('wheel', onMouseWheel);
        };
    }
    get position() {
        return this.camera.position;
    }
    get rotation() {
        return this.camera.rotation;
    }
    get viewPoint() {
        if (this.camera.viewPoint instanceof TRSObject) {
            Instances$1.v3_2.setFromMatrix4(this.camera.viewPoint.modelMatrix);
            return Instances$1.v3_2;
        }
        else {
            return this.camera.viewPoint;
        }
    }
    update() {
        Instances$1.v3_1.subVectors(this.position, this.viewPoint);
        Instances$1.sph.setFromVector3(Instances$1.v3_1);
        Instances$1.sph.theta -= this.rotateDelta.x;
        Instances$1.sph.phi -= this.rotateDelta.y;
        Instances$1.sph.makeSafe();
        Instances$1.sph.radius *= this.zoom;
        Instances$1.sph.toVector3(Instances$1.v3_1);
        this.viewPoint.sub(this.panOffset);
        this.position.copy(this.viewPoint);
        this.position.add(Instances$1.v3_1);
        this.panOffset.setScalar(0);
        this.rotateDelta.setScalar(0);
        this.zoom = 1;
        Instances$1.m4.makeLookAt(this.position, this.viewPoint);
        this.rotation.setFromMatrix4(Instances$1.m4);
    }
    onContextMenu(event) {
        event.preventDefault();
    }
    onPointerDown(event) {
        this.canvas.setPointerCapture(event.pointerId);
        if (event.button === 0) {
            this.state = 'rotate';
            this.rotateStart.set(event.clientX, event.clientY);
        }
        else if (event.button === 2) {
            this.state = 'pan';
            this.panStart.set(event.clientX, event.clientY);
        }
    }
    onPointerMove(event) {
        if (this.state === 'rotate') {
            this.rotateEnd.set(event.clientX, event.clientY);
            this.rotateStart.subVectors(this.rotateEnd, this.rotateStart);
            this.rotateStart.multiplyScalar(2 * Math.PI / this.canvas.height);
            this.rotateDelta.add(this.rotateStart);
            this.rotateStart.copy(this.rotateEnd);
            return;
        }
        if (this.state === 'pan') {
            this.panEnd.set(event.clientX, event.clientY);
            this.panStart.subVectors(this.panEnd, this.panStart);
            const halfFov = this.camera.fov / 360 * Math.PI;
            let edge = this.position.distanceTo(this.viewPoint);
            edge *= Math.tan(halfFov);
            this.panStart.multiplyScalar(2 * edge / this.canvas.height);
            Instances$1.v3_1.set(this.panStart.x, -this.panStart.y, 0);
            Instances$1.m3.setFromMatrix4(this.camera.modelMatrix);
            Instances$1.v3_1.applyMatrix3(Instances$1.m3);
            this.panOffset.add(Instances$1.v3_1);
            this.panStart.copy(this.panEnd);
            return;
        }
    }
    onPointerUp(event) {
        this.canvas.releasePointerCapture(event.pointerId);
        this.state = 'none';
    }
    onMouseWheel(event) {
        event.preventDefault();
        if (event.deltaY < 0) {
            this.zoom *= 0.9;
        }
        if (event.deltaY > 0) {
            this.zoom /= 0.9;
        }
    }
}
class Camera extends TRSObject {
    viewPoint = new Vector3();
    controls;
    viewMatrix = new Matrix4();
    projectionMatrix = new Matrix4();
    fov = 50;
    aspect = 1;
    near = 1;
    far = 2000;
    constructor(canvas) {
        super();
        this.name = 'camera';
        this.controls = new Controls(this, canvas);
    }
    updateMatrix(updateParents, updateChildren) {
        this.controls.update();
        super.updateMatrix(updateParents, updateChildren);
        this.viewMatrix.copy(this.modelMatrix).invert();
    }
    updateProjectionMatrix() {
        const near = this.near;
        const far = this.far;
        const fov = this.fov / 180 * Math.PI;
        const top = near * Math.tan(fov * 0.5);
        const bottom = -top;
        const right = top * this.aspect;
        const left = -right;
        this.projectionMatrix.makePerspective(left, right, top, bottom, near, far);
    }
}

var vertexShader = "#version 300 es\r\n\r\nin vec3 position;\r\nin vec2 uv;\r\n\r\nuniform bool isCube;\r\nuniform mat4 viewMatrix;\r\nuniform mat4 projectionMatrix;\r\n\r\nout vec2 vUv;\r\nout vec3 v_position;\r\n\r\nvoid main() {\r\n\r\n    vUv = uv;\r\n\r\n    float depth = 0.99999f;\r\n\r\n    if(isCube) {\r\n\r\n        v_position = normalize(position);\r\n\r\n        vec4 mvPosition = viewMatrix * vec4(position, 0);\r\n        mvPosition.w = 1.0f;\r\n\r\n        gl_Position = projectionMatrix * mvPosition;\r\n        gl_Position.z = gl_Position.w * depth;\r\n\r\n    } else {\r\n\r\n        gl_Position = vec4(position.xy, depth, 1);\r\n\r\n    }\r\n\r\n}";

var fragmentShader = "#version 300 es\r\n\r\nprecision highp float;\r\nprecision highp int;\r\n\r\nout vec4 oColor;\r\n\r\nuniform bool isCube;\r\nuniform samplerCube cube;\r\nuniform sampler2D map;\r\n\r\nin vec2 vUv;\r\nin vec3 v_position;\r\n\r\nvoid main() {\r\n\r\n    if(isCube) {\r\n\r\n        oColor = texture(cube, v_position);\r\n\r\n    } else {\r\n\r\n        oColor = texture(map, vUv);\r\n\r\n    }\r\n\r\n}";

class BGMaterial extends Material {
    constructor() {
        super();
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;
        this.setUniform('map', undefined);
        this.setUniform('cube', undefined);
        this.setUniform('isCube', false);
        this.setUniform('viewMatrix', new Matrix4());
        this.setUniform('projectionMatrix', new Matrix4());
    }
    get map() {
        return this.uniforms.map.value;
    }
    set map(map) {
        this.uniforms.map.value = map;
    }
    get cube() {
        return this.uniforms.cube.value;
    }
    set cube(cube) {
        this.uniforms.cube.value = cube;
    }
    get isCube() {
        return this.uniforms.isCube.value;
    }
    set isCube(flag) {
        this.uniforms.isCube.value = !!flag;
    }
    onBeforRender(scene, mesh, camera) {
        if (this.isCube) {
            this.uniforms.viewMatrix.value.copy(camera.viewMatrix);
            this.uniforms.projectionMatrix.value.copy(camera.projectionMatrix);
        }
    }
    dispose() {
        super.emit('dispose');
    }
}

class Instances {
    static m3 = new Matrix3();
}
class Light extends TRSObject {
    lightColor = new Color(1, 1, 1);
    lightIntensity = 1;
    color = new Color(1, 1, 1);
    constructor() {
        super();
        this.name = 'light';
    }
    update(camera) {
        this.color.copy(this.lightColor);
        this.color.multiplyScalar(this.lightIntensity);
    }
}
class AmbientLight extends Light {
    constructor() {
        super();
        this.name = 'ambientLight';
    }
}
class DirectionalLight extends Light {
    target = new Vector3(0, 0, 0);
    direction = new Vector3(0, 1, 0);
    constructor() {
        super();
        this.name = 'directionalLight';
    }
    update(camera) {
        super.update();
        this.direction.copy(this.position);
        this.direction.sub(this.target);
        Instances.m3.setFromMatrix4(camera.viewMatrix);
        this.direction.applyMatrix3(Instances.m3);
        this.direction.normalize();
    }
}

class Scene extends TRSObject {
    static planeMesh;
    static cubeMesh;
    background;
    ambientLight;
    directionalLight;
    constructor() {
        super();
        this.name = 'scene';
        this.ambientLight = new AmbientLight();
        this.directionalLight = new DirectionalLight();
    }
    updateMatrix(updateParents, updateChildren) {
        super.updateMatrix(updateParents, updateChildren);
        this.ambientLight.updateMatrix();
        this.directionalLight.updateMatrix();
    }
    updateLights(camera) {
        this.ambientLight.update();
        this.directionalLight.update(camera);
    }
    setBackgroundColor(color) {
        if (this.background instanceof Mesh) {
            this.background.dispose();
        }
        this.background = new Color();
        this.background.setStyle(color);
    }
    setBackgroundImage(image) {
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
        const material = this.background.material;
        material.map && material.map.dispose();
        material.map = new Texture(image);
    }
    setBackgroundCube(images) {
        if (!Scene.cubeMesh) {
            const DLF = [-0.5, -0.5, 0.5];
            const DRF = [0.5, -0.5, 0.5];
            const URF = [0.5, 0.5, 0.5];
            const ULF = [-0.5, 0.5, 0.5];
            const DLB = [-0.5, -0.5, -0.5];
            const DRB = [0.5, -0.5, -0.5];
            const URB = [0.5, 0.5, -0.5];
            const ULB = [-0.5, 0.5, -0.5];
            const vertices = [
                ULF, ULB, URB, ULF, URB, URF,
                DLB, DLF, DRF, DLB, DRF, DRB,
                DLB, ULB, ULF, DLB, ULF, DLF,
                DRF, URF, URB, DRF, URB, DRB,
                DLF, ULF, URF, DLF, URF, DRF,
                DRB, URB, ULB, DRB, ULB, DLB,
            ].flat();
            const position = new Attribute(new Float32Array(vertices), 3);
            const geometry = new Geometry();
            geometry.setAttribute('position', position);
            const material = new BGMaterial();
            material.isCube = true;
            Scene.cubeMesh = new Mesh(geometry, material);
        }
        this.background = Scene.cubeMesh;
        const material = this.background.material;
        material.cube && material.cube.dispose();
        material.cube = new CubeTexture(images);
    }
}

class WebGLAttribute {
    location;
    name;
    gl;
    state;
    cache;
    enableVAOs = new Set();
    pointerVAOs = new Map();
    constructor(renderer, location, name, gl = renderer.gl, state = renderer.state, cache = renderer.cache) {
        this.location = location;
        this.name = name;
        this.gl = gl;
        this.state = state;
        this.cache = cache;
    }
    isEnable(vao) {
        return this.enableVAOs.has(vao);
    }
    enable(vao) {
        if (!this.isEnable(vao)) {
            this.state.bindVertexArray(vao);
            this.gl.enableVertexAttribArray(this.location);
            this.enableVAOs.add(vao);
        }
    }
    disable(vao) {
        if (this.isEnable(vao)) {
            this.state.bindVertexArray(vao);
            this.gl.disableVertexAttribArray(this.location);
            this.enableVAOs.delete(vao);
        }
    }
    bind(attribute, vao) {
        const buffer = this.cache.getBuffer(attribute);
        if (!buffer) {
            return;
        }
        let pointerInfo = this.pointerVAOs.get(vao);
        if (!pointerInfo) {
            pointerInfo = {};
            this.pointerVAOs.set(vao, pointerInfo);
            this.enable(vao);
        }
        const itemSize = attribute.itemSize;
        const dataType = attribute.dataType;
        const normalized = attribute.normalized;
        if (pointerInfo.buffer === buffer &&
            pointerInfo.size === itemSize &&
            pointerInfo.type == dataType &&
            pointerInfo.normalized === normalized) {
            return;
        }
        pointerInfo.buffer = buffer;
        pointerInfo.size = itemSize;
        pointerInfo.type = dataType;
        pointerInfo.normalized = normalized;
        this.state.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.vertexAttribPointer(this.location, itemSize, dataType, normalized, 0, 0);
    }
    onDeleteVAO(vao) {
        if (this.enableVAOs.has(vao)) {
            this.enableVAOs.delete(vao);
        }
        if (this.pointerVAOs.has(vao)) {
            this.pointerVAOs.delete(vao);
        }
    }
}

class Vector4 {
    x;
    y;
    z;
    w;
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    set(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        this.w = v.w;
        return this;
    }
    equals(v) {
        return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;
    }
    equalsComponent(x, y, z, w) {
        return x === this.x && y === this.y && z === this.z && w === this.w;
    }
}

class WebGLUniformHelper {
    static toUniforms(gl, info, location, uniforms) {
        WebGLUniformHelper.createUniform(gl, info, location, info.name, uniforms);
    }
    static createUniform(gl, info, location, path, uniforms) {
        const dotIndex = path.indexOf('.');
        const braIndex = path.indexOf('[');
        if (dotIndex !== -1 &&
            braIndex !== -1 &&
            braIndex < dotIndex) {
            WebGLUniformHelper.createArrayStruct(gl, info, location, path, uniforms);
        }
        else if (dotIndex !== -1) {
            WebGLUniformHelper.createStruct(gl, info, location, path, uniforms);
        }
        else if (braIndex !== -1) {
            WebGLUniformHelper.createArray(gl, info, location, path, uniforms);
        }
        else {
            WebGLUniformHelper.createSingle(gl, info, location, path, uniforms);
        }
    }
    static createSingle(gl, info, location, name, uniforms) {
        let uniform;
        switch (info.type) {
            case gl.FLOAT:
                uniform = new FNumberUniform(gl, info, location, name);
                break;
            case gl.INT:
            case gl.BOOL:
                uniform = new INumberUniform(gl, info, location, name);
                break;
            case gl.FLOAT_VEC2:
                uniform = new FVector2Uniform(gl, info, location, name);
                break;
            case gl.INT_VEC2:
            case gl.BOOL_VEC2:
                uniform = new IVector2Uniform(gl, info, location, name);
                break;
            case gl.FLOAT_VEC3:
                uniform = new FVector3Uniform(gl, info, location, name);
                break;
            case gl.INT_VEC3:
            case gl.BOOL_VEC3:
                uniform = new IVector3Uniform(gl, info, location, name);
                break;
            case gl.FLOAT_VEC4:
                uniform = new FVector4Uniform(gl, info, location, name);
                break;
            case gl.INT_VEC4:
            case gl.BOOL_VEC4:
                uniform = new IVector4Uniform(gl, info, location, name);
                break;
            case gl.FLOAT_MAT3:
                uniform = new Matrix3Uniform(gl, info, location, name);
                break;
            case gl.FLOAT_MAT4:
                uniform = new Matrix4Uniform(gl, info, location, name);
                break;
            case gl.SAMPLER_2D:
            case gl.SAMPLER_CUBE:
                uniform = new TextureUniform(gl, info, location, name);
                break;
            default:
                throw new Error(`DXY.WebGLUniform : 不支持 ${info.type} 类型的 uniform . `);
        }
        uniforms.push(uniform);
    }
    static createArray(gl, info, location, path, uniforms) {
        const LSBI = path.indexOf('[');
        path = path.substring(0, LSBI);
        let uniform;
        switch (info.type) {
            case gl.FLOAT:
                uniform = new FArrayUniform(gl, info, location, path);
                break;
            case gl.INT:
            case gl.BOOL:
                uniform = new IArrayUniform(gl, info, location, path);
                break;
            default:
                throw new Error(`DXY.WebGLUniform : 不支持 ${info.type} 类型的 uniform . `);
        }
        uniform.size = info.size;
        uniforms.push(uniform);
    }
    static createStruct(gl, info, location, name, uniforms) {
        const dotIndex = name.indexOf('.');
        const firstName = name.substring(0, dotIndex);
        let struct = uniforms.find(e => e.name === firstName);
        if (!struct) {
            struct = new StructUniform(gl, info, location, firstName);
            uniforms.push(struct);
        }
        name = name.substring(dotIndex + 1);
        WebGLUniformHelper.createUniform(gl, info, location, name, struct.uniforms);
    }
    static createArrayStruct(gl, info, location, path, uniforms) {
        const LSBI = path.indexOf('[');
        const firstName = path.substring(0, LSBI);
        let structArray = uniforms.find(e => e.name === firstName);
        if (!structArray) {
            structArray = new StructArrayUniform(gl, info, location, firstName);
            uniforms.push(structArray);
        }
        const RSBI = path.indexOf(']');
        const indexStr = path.substring(LSBI + 1, RSBI);
        const index = Number(indexStr);
        structArray.size = index + 1;
        let struct = structArray.uniforms[index];
        if (!struct) {
            struct = new StructUniform(gl, info, location, indexStr);
            structArray.uniforms[index] = struct;
        }
        path = path.substring(RSBI + 2);
        WebGLUniformHelper.createSingle(gl, info, location, path, struct.uniforms);
    }
}
class WebGLUniform {
    gl;
    info;
    location;
    name;
    current;
    constructor(gl, info, location, name, current) {
        this.gl = gl;
        this.info = info;
        this.location = location;
        this.name = name;
        this.current = current;
    }
    set(value) { }
    static toUniforms(gl, info, location, uniforms = []) {
        WebGLUniformHelper.toUniforms(gl, info, location, uniforms);
        return uniforms;
    }
}
class ArrayUniform extends WebGLUniform {
    size = 0;
    constructor(gl, info, location, name) {
        super(gl, info, location, name, []);
    }
    set(value) {
        if (Array.isArray(value) && value.length >= this.size) {
            this.current = value;
            this.safeSet();
        }
    }
    safeSet() { }
}
class FArrayUniform extends ArrayUniform {
    safeSet() {
        this.gl.uniform1fv(this.location, this.current);
    }
}
class IArrayUniform extends ArrayUniform {
    safeSet() {
        this.gl.uniform1iv(this.location, this.current);
    }
}
class StructArrayUniform extends ArrayUniform {
    uniforms = [];
    safeSet() {
        for (let ii = 0, li = this.uniforms.length; ii < li; ii++) {
            this.uniforms[ii].set(this.current[ii]);
        }
    }
}
class FNumberUniform extends WebGLUniform {
    constructor(gl, info, location, name) {
        super(gl, info, location, name, NaN);
    }
    set(value) {
        if (typeof value !== 'number') {
            value = Number(value);
        }
        if (value !== this.current) {
            this.current = value;
            this.safeSet();
        }
    }
    safeSet() {
        this.gl.uniform1f(this.location, this.current);
    }
}
class INumberUniform extends FNumberUniform {
    safeSet() {
        this.gl.uniform1i(this.location, this.current);
    }
}
class TextureUniform extends INumberUniform {
}
class StructUniform extends WebGLUniform {
    uniforms = [];
    constructor(gl, info, location, name) {
        super(gl, info, location, name, {});
    }
    set(valueObject) {
        this.current = valueObject;
        for (const uniform of this.uniforms) {
            if (uniform.name in valueObject) {
                uniform.set(valueObject[uniform.name]);
            }
        }
    }
}
class FVector2Uniform extends WebGLUniform {
    constructor(gl, info, location, name) {
        super(gl, info, location, name, new Vector2(NaN, NaN));
    }
    set(value) {
        if (value instanceof Vector2 && !this.current.equals(value)) {
            this.current.copy(value);
            this.safeSet();
        }
    }
    safeSet() {
        this.gl.uniform2f(this.location, this.current.x, this.current.y);
    }
}
class IVector2Uniform extends FVector2Uniform {
    safeSet() {
        this.gl.uniform2i(this.location, this.current.x, this.current.y);
    }
}
class FVector3Uniform extends WebGLUniform {
    constructor(gl, info, location, name) {
        super(gl, info, location, name, new Vector3(NaN, NaN, NaN));
    }
    set(value) {
        if (value instanceof Vector3 && !this.current.equals(value)) {
            this.current.copy(value);
            this.safeSet();
        }
        if (value instanceof Color &&
            (value.r !== this.current.x ||
                value.g !== this.current.y ||
                value.b !== this.current.z)) {
            value.toVector3(this.current);
            this.safeSet();
        }
    }
    safeSet() {
        this.gl.uniform3f(this.location, this.current.x, this.current.y, this.current.z);
    }
}
class IVector3Uniform extends FVector3Uniform {
    safeSet() {
        this.gl.uniform3i(this.location, this.current.x, this.current.y, this.current.z);
    }
}
class FVector4Uniform extends WebGLUniform {
    constructor(gl, info, location, name) {
        super(gl, info, location, name, new Vector4(NaN, NaN, NaN, NaN));
    }
    set(value) {
        if (value instanceof Vector4 && !this.current.equals(value)) {
            this.current.copy(value);
            this.safeSet();
        }
    }
    safeSet() {
        this.gl.uniform4f(this.location, this.current.x, this.current.y, this.current.z, this.current.w);
    }
}
class IVector4Uniform extends FVector4Uniform {
    safeSet() {
        this.gl.uniform4i(this.location, this.current.x, this.current.y, this.current.z, this.current.w);
    }
}
class Matrix3Uniform extends WebGLUniform {
    constructor(gl, info, location, name) {
        super(gl, info, location, name, new Matrix3([]));
    }
    set(value) {
        if (value instanceof Matrix3 && !this.current.equals(value)) {
            this.current.copy(value);
            this.gl.uniformMatrix3fv(this.location, false, this.current.elements);
        }
    }
}
class Matrix4Uniform extends WebGLUniform {
    constructor(gl, info, location, name) {
        super(gl, info, location, name, new Matrix4([]));
    }
    set(value) {
        if (value instanceof Matrix4 && !this.current.equals(value)) {
            this.current.copy(value);
            this.gl.uniformMatrix4fv(this.location, false, this.current.elements);
        }
    }
}

class WebGLCacheHelper {
    static setLineNumber(source) {
        function fn(lineContent, lineIndex) {
            return `${lineIndex + 1}: ${lineContent}`;
        }
        return source.split('\n').map(fn).join('\n');
    }
}
class WebGLCache {
    renderer;
    gl;
    static renderItems = [];
    programs = new Map();
    shaders = new Map();
    attributes = new Map();
    uniforms = new Map();
    buffers = new Map();
    textures = new Map();
    vaos = new Map();
    constructor(renderer, gl = renderer.gl) {
        this.renderer = renderer;
        this.gl = gl;
    }
    mallocRenderItem(mesh, geometry, material, group) {
        const item = WebGLCache.renderItems.shift() || {};
        item.mesh = mesh;
        item.geometry = geometry;
        item.material = material;
        item.group = group;
        return item;
    }
    freeRenderItem(items) {
        for (const item of items) {
            item.mesh = undefined;
            item.geometry = undefined;
            item.material = undefined;
            item.group = undefined;
            item.program = undefined;
            WebGLCache.renderItems.push(item);
        }
        items.length = 0;
    }
    acquireProgram(material) {
        const key = `${material.vertexShader}-${material.fragmentShader}`;
        let program = this.programs.get(key);
        if (!program) {
            const vertexShader = this.acquireShader(material.vertexShader, this.gl.VERTEX_SHADER);
            const fragmentShader = this.acquireShader(material.fragmentShader, this.gl.FRAGMENT_SHADER);
            program = this.gl.createProgram();
            this.gl.attachShader(program, vertexShader);
            this.gl.attachShader(program, fragmentShader);
            this.gl.linkProgram(program);
            const linked = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
            if (!linked) {
                const reminder = 'Dxy.WebGLCache : 链接着色器程序错误 . ';
                const lastError = this.gl.getProgramInfoLog(program);
                throw new Error([reminder, lastError].join('\n'));
            }
            this.programs.set(key, program);
            material.on('dispose', this.onMaterialDispose, this);
        }
        return program;
    }
    onMaterialDispose(parameters) {
        const material = parameters.source;
        material.off('dispose', this.onMaterialDispose);
    }
    acquireShader(source, type) {
        let shader = this.shaders.get(source);
        if (!shader) {
            shader = this.gl.createShader(type);
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);
            const compiled = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
            if (!compiled) {
                const reminder = 'Dxy.WebGLCache.acquireShader : 编译着色器代码错误 .';
                const lastError = this.gl.getShaderInfoLog(shader);
                source = WebGLCacheHelper.setLineNumber(source);
                throw new Error([reminder, lastError, source].join('\n'));
            }
            this.shaders.set(source, shader);
        }
        return shader;
    }
    acquireAttributes(program) {
        let attributes = this.attributes.get(program);
        if (!attributes) {
            attributes = [];
            const count = this.gl.getProgramParameter(program, this.gl.ACTIVE_ATTRIBUTES);
            for (let ii = 0; ii < count; ii++) {
                const info = this.gl.getActiveAttrib(program, ii);
                const location = this.gl.getAttribLocation(program, info.name);
                const attribute = new WebGLAttribute(this.renderer, location, info.name);
                attributes.push(attribute);
            }
            this.attributes.set(program, attributes);
        }
        return attributes;
    }
    acquireUniforms(program) {
        let uniforms = this.uniforms.get(program);
        if (!uniforms) {
            uniforms = [];
            const count = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORMS);
            for (let ii = 0; ii < count; ii++) {
                const info = this.gl.getActiveUniform(program, ii);
                const location = this.gl.getUniformLocation(program, info.name);
                WebGLUniform.toUniforms(this.gl, info, location, uniforms);
            }
            this.uniforms.set(program, uniforms);
        }
        return uniforms;
    }
    getBuffer(attribute) {
        return this.buffers.get(attribute);
    }
    acquireBuffer(attribute) {
        let buffer = this.buffers.get(attribute);
        if (!buffer) {
            buffer = this.gl.createBuffer();
            attribute.on('dispose', this.onAttributeDispose, this);
            this.buffers.set(attribute, buffer);
        }
        return buffer;
    }
    onAttributeDispose(parameters) {
        const attribute = parameters.source;
        attribute.off('dispose', this.onAttributeDispose);
        const buffer = this.buffers.get(attribute);
        if (!buffer) {
            return;
        }
        this.buffers.delete(attribute);
        this.gl.deleteBuffer(buffer);
    }
    getTexture(texture) {
        return this.textures.get(texture);
    }
    acquireTexture(texture) {
        let webglTexture = this.textures.get(texture);
        if (webglTexture === undefined) {
            webglTexture = this.gl.createTexture();
            texture.on('dispose', this.onTextureDispose, this);
            this.textures.set(texture, webglTexture);
        }
        return webglTexture;
    }
    onTextureDispose(parameters) {
        const texture = parameters.source;
        texture.off('dispose', this.onTextureDispose);
        const webglTexture = this.textures.get(texture);
        if (!webglTexture) {
            return;
        }
        this.textures.delete(texture);
        this.gl.deleteTexture(webglTexture);
    }
    acquireVertexArray(geometry) {
        let vao = this.vaos.get(geometry);
        if (vao === undefined) {
            vao = this.gl.createVertexArray();
            geometry.on('dispose', this.onGeometryDispose, this);
            this.vaos.set(geometry, vao);
        }
        return vao;
    }
    onGeometryDispose(parameters) {
        const geometry = parameters.source;
        geometry.off('dispose', this.onGeometryDispose);
        const vao = this.vaos.get(geometry);
        if (!vao) {
            return;
        }
        this.vaos.delete(geometry);
        for (const [, attributes] of this.attributes) {
            for (const attribute of attributes) {
                attribute.onDeleteVAO(vao);
            }
        }
        this.gl.deleteVertexArray(vao);
    }
}

class WebGLState {
    gl;
    clearColor = new Vector4(0, 0, 0, 0);
    viewport = new Vector4(0, 0, 0, 0);
    program;
    vao;
    arrayBuffer;
    elementArrayBuffer;
    maxTextures;
    textureUnits = 0;
    textureUnit = 0;
    texture2D;
    textureCubeMap;
    frontFace = false;
    stateCache = new Map();
    constructor(renderer, gl = renderer.gl) {
        this.gl = gl;
        this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        gl.enable(gl.DEPTH_TEST);
    }
    setClearColor(r, g, b, a = 1) {
        if (!this.clearColor.equalsComponent(r, g, b, a)) {
            this.clearColor.set(r, g, b, a);
            this.gl.clearColor(r, g, b, a);
        }
    }
    setViewport(x, y, width, height) {
        if (!this.viewport.equalsComponent(x, y, width, height)) {
            this.viewport.set(x, y, width, height);
            this.gl.viewport(x, y, width, height);
        }
    }
    useProgram(program) {
        if (this.program !== program) {
            this.program = program;
            this.gl.useProgram(program);
        }
    }
    resetTextureUnits() {
        this.textureUnits = 0;
    }
    allocateTextureUnits() {
        const textureUnits = this.textureUnits;
        if (textureUnits >= this.maxTextures) {
            console.warn(`Dxy.WebGLState : 纹理单元超过了最大限制 ${textureUnits} . `);
        }
        this.textureUnits++;
        return textureUnits;
    }
    bindTexture(target, texture) {
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
    activeTexture(unit) {
        if (this.textureUnit !== unit) {
            this.gl.activeTexture(this.gl.TEXTURE0 + unit);
            this.textureUnit = unit;
        }
    }
    bindBuffer(target, buffer) {
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
    bindVertexArray(vao) {
        if (this.vao !== vao) {
            this.vao = vao;
            this.gl.bindVertexArray(vao);
        }
    }
    setFrontFace(isCW) {
        if (this.frontFace !== isCW) {
            this.frontFace = isCW;
            this.gl.frontFace(isCW ? this.gl.CW : this.gl.CCW);
        }
    }
    enable(id) {
        if (!this.stateCache.get(id)) {
            this.gl.enable(id);
            this.stateCache.set(id, true);
        }
    }
    disable(id) {
        if (this.stateCache.get(id)) {
            this.gl.disable(id);
            this.stateCache.set(id, false);
        }
    }
    depthTest(isEnable) {
        if (isEnable) {
            this.enable(this.gl.DEPTH_TEST);
        }
        else {
            this.disable(this.gl.DEPTH_TEST);
        }
    }
    backfaceCulling(isEnable) {
        if (isEnable) {
            this.enable(this.gl.CULL_FACE);
            this.gl.cullFace(this.gl.BACK);
        }
        else {
            this.disable(this.gl.CULL_FACE);
        }
    }
}

class ContextHelper {
    static attributes = {
        alpha: true,
        depth: true,
        stencil: true,
        antialias: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
    };
    static getWebGL2(canvas) {
        const context = canvas.getContext('webgl2', this.attributes);
        if (!context) {
            throw new Error('Dxy.WebGL : 当前环境不支持 webgl2 . ');
        }
        return context;
    }
}
class WebGL {
    gl;
    cache;
    state;
    constructor(canvas) {
        this.gl = ContextHelper.getWebGL2(canvas);
        this.cache = new WebGLCache(this);
        this.state = new WebGLState(this);
    }
    render(scene, camera) {
        const gl = this.gl;
        camera.updateMatrix();
        scene.updateLights(camera);
        const renderList = [];
        this.projectObject(scene, camera, renderList);
        this.renderBackground(scene, camera, renderList);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        this.renderObjects(renderList, scene, camera);
        this.cache.freeRenderItem(renderList);
    }
    projectObject(object, camera, renderList) {
        if (!object.visible) {
            return;
        }
        object.updateMatrix();
        if (object instanceof Mesh) {
            object.updateModelViewMatrix(camera.viewMatrix);
            const geometry = object.geometry;
            if (Array.isArray(object.material)) {
                const materials = object.material;
                const renderGroups = geometry.groups;
                for (const group of renderGroups) {
                    const material = materials[group.materialIndex];
                    const item = this.cache.mallocRenderItem(object, geometry, material, group);
                    renderList.push(item);
                }
            }
            else {
                const item = this.cache.mallocRenderItem(object, geometry, object.material);
                renderList.push(item);
            }
        }
        for (const child of object.children) {
            this.projectObject(child, camera, renderList);
        }
    }
    renderBackground(scene, camera, renderList) {
        if (scene.background instanceof Color) {
            this.state.setClearColor(scene.background.r, scene.background.g, scene.background.b);
        }
        else if (scene.background instanceof Mesh) {
            const item = this.cache.mallocRenderItem(scene.background, scene.background.geometry, scene.background.material);
            renderList.unshift(item);
        }
    }
    renderObjects(renderList, scene, camera) {
        for (const item of renderList) {
            const material = item.material;
            const program = this.cache.acquireProgram(material);
            item.program = program;
            this.state.useProgram(program);
            this.bindGeometry(item);
            this.applyMaterial(item, scene, camera);
            this.renderBuffer(item);
        }
    }
    bindGeometry(item) {
        const geometry = item.geometry;
        const program = item.program;
        const vao = this.cache.acquireVertexArray(geometry);
        this.state.bindVertexArray(vao);
        const webglAttributes = this.cache.acquireAttributes(program);
        for (const webglAttribute of webglAttributes) {
            const attribute = geometry.getAttribute(webglAttribute.name);
            if (!attribute) {
                webglAttribute.disable(vao);
                continue;
            }
            this.uploadAttributeToGPU(this.gl.ARRAY_BUFFER, attribute);
            webglAttribute.bind(attribute, vao);
        }
        if (geometry.indices !== undefined) {
            this.uploadAttributeToGPU(this.gl.ELEMENT_ARRAY_BUFFER, geometry.indices);
        }
    }
    uploadAttributeToGPU(target, attribute) {
        let buffer = this.cache.getBuffer(attribute);
        if (!buffer) {
            buffer = this.cache.acquireBuffer(attribute);
            this.state.bindBuffer(target, buffer);
            this.gl.bufferData(target, attribute.array, attribute.dataUsage);
            attribute.needsUpdate = false;
        }
        if (attribute.needsUpdate === true) {
            this.state.bindBuffer(target, buffer);
            this.gl.bufferSubData(target, 0, attribute.array);
            attribute.needsUpdate = false;
        }
    }
    applyMaterial(item, scene, camera) {
        const mesh = item.mesh;
        const material = item.material;
        material.onBeforRender(scene, mesh, camera);
        const frontFaceCW = mesh.modelMatrix.determinant() < 0;
        this.state.setFrontFace(frontFaceCW);
        this.state.backfaceCulling(material.backfaceCulling);
        this.state.resetTextureUnits();
        this.uploadUniform(item);
    }
    uploadUniform(item) {
        const material = item.material;
        const program = item.program;
        const webglUniforms = this.cache.acquireUniforms(program);
        for (const webglUniform of webglUniforms) {
            const uniform = material.getUniform(webglUniform.name);
            if (webglUniform instanceof TextureUniform) {
                const unit = this.state.allocateTextureUnits();
                if (uniform && uniform.value) {
                    this.state.activeTexture(unit);
                    this.uploadTextureToGPU(uniform.value);
                }
                webglUniform.set(unit);
            }
            else if (uniform) {
                webglUniform.set(uniform.value);
            }
        }
    }
    uploadTextureToGPU(texture) {
        let webglTexture = this.cache.getTexture(texture);
        if (texture instanceof CubeTexture && texture.images && texture.images.length >= 6) {
            const target = this.gl.TEXTURE_CUBE_MAP;
            if (!webglTexture) {
                webglTexture = this.cache.acquireTexture(texture);
                this.state.bindTexture(target, webglTexture);
                const levels = 1;
                const format = this.gl.RGBA8;
                const width = texture.images[0].width;
                const height = texture.images[0].height;
                this.gl.texStorage2D(target, levels, format, width, height);
                texture.needsUpdate = true;
            }
            if (texture.needsUpdate === true) {
                this.state.bindTexture(target, webglTexture);
                this.gl.texParameteri(target, this.gl.TEXTURE_WRAP_S, texture.wrapS);
                this.gl.texParameteri(target, this.gl.TEXTURE_WRAP_T, texture.wrapT);
                this.gl.texParameteri(target, this.gl.TEXTURE_MAG_FILTER, texture.magFilter);
                this.gl.texParameteri(target, this.gl.TEXTURE_MIN_FILTER, texture.minFilter);
                const pxTarget = this.gl.TEXTURE_CUBE_MAP_POSITIVE_X;
                const level = 0;
                const xoffset = 0;
                const yoffset = 0;
                const format = this.gl.RGBA;
                const type = this.gl.UNSIGNED_BYTE;
                for (let ii = 0; ii < 6; ii++) {
                    this.gl.texSubImage2D(pxTarget + ii, level, xoffset, yoffset, format, type, texture.images[ii]);
                }
                this.gl.generateMipmap(target);
                texture.needsUpdate = false;
            }
            else {
                this.state.bindTexture(target, webglTexture);
            }
        }
        else if (texture instanceof Texture && texture.image) {
            const target = this.gl.TEXTURE_2D;
            if (!webglTexture) {
                webglTexture = this.cache.acquireTexture(texture);
                this.state.bindTexture(target, webglTexture);
                const levels = 1;
                const format = this.gl.RGBA8;
                const width = texture.image.width;
                const height = texture.image.height;
                this.gl.texStorage2D(target, levels, format, width, height);
                texture.needsUpdate = true;
            }
            if (texture.needsUpdate === true) {
                this.state.bindTexture(target, webglTexture);
                this.gl.texParameteri(target, this.gl.TEXTURE_WRAP_S, texture.wrapS);
                this.gl.texParameteri(target, this.gl.TEXTURE_WRAP_T, texture.wrapT);
                this.gl.texParameteri(target, this.gl.TEXTURE_MAG_FILTER, texture.magFilter);
                this.gl.texParameteri(target, this.gl.TEXTURE_MIN_FILTER, texture.minFilter);
                const level = 0;
                const xoffset = 0;
                const yoffset = 0;
                const format = this.gl.RGBA;
                const type = this.gl.UNSIGNED_BYTE;
                this.gl.texSubImage2D(target, level, xoffset, yoffset, format, type, texture.image);
                this.gl.generateMipmap(target);
                texture.needsUpdate = false;
            }
            else {
                this.state.bindTexture(target, webglTexture);
            }
        }
    }
    renderBuffer(item) {
        const geometry = item.geometry;
        const group = item.group;
        let start = -Infinity, count = Infinity;
        if (group) {
            start = group.start;
            count = group.count;
        }
        if (geometry.indices) {
            const indices = geometry.indices;
            start = Math.max(start, 0);
            count = Math.min(count, indices.count);
            const buffer = this.cache.acquireBuffer(indices);
            this.state.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
            const offset = start * indices.array.BYTES_PER_ELEMENT;
            this.gl.drawElements(this.gl.TRIANGLES, count, indices.dataType, offset);
        }
        else if (geometry.position) {
            const position = geometry.position;
            start = Math.max(start, 0);
            count = Math.min(count, position.count);
            this.gl.drawArrays(this.gl.TRIANGLES, start, count);
        }
    }
}

class Dxy {
    canvas;
    frameHandle = -1;
    width = -1;
    height = -1;
    renderer;
    scene;
    camera;
    constructor(canvas = document.createElement('canvas')) {
        this.canvas = canvas;
        this.renderer = new WebGL(canvas);
        this.camera = new Camera(canvas);
        this.scene = new Scene();
        this.startAnimationFrame();
    }
    startAnimationFrame() {
        if (this.frameHandle !== -1) {
            return;
        }
        const scope = this;
        let _elapsed = 0, _delta = 0;
        function frameCallback(time) {
            scope.frameHandle = requestAnimationFrame(frameCallback);
            time /= 1000;
            _delta = time - _elapsed;
            _elapsed = time;
            scope.animate(_delta);
        }
        this.frameHandle = requestAnimationFrame(frameCallback);
    }
    animate(delta) {
        if (this.width !== this.canvas.clientWidth || this.height !== this.canvas.clientHeight) {
            this.width = this.canvas.clientWidth;
            this.height = this.canvas.clientHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            this.renderer.state.setViewport(0, 0, this.width, this.height);
        }
        this.renderer.render(this.scene, this.camera);
    }
    destroy() {
        cancelAnimationFrame(this.frameHandle);
        this.frameHandle = -1;
    }
    loadModel(parameters = {}) {
        const type = parameters.type || 'glb';
        const url = parameters.url;
        switch (type) {
            case 'glb':
                GLBLoader.load(url, (object) => {
                    if (object) {
                        this.scene.add(object);
                    }
                });
                break;
        }
    }
    setBackground(parameters = {}) {
        const type = parameters.type;
        const color = parameters.color;
        const image = parameters.image;
        const skybox = parameters.skybox;
        switch (type) {
            case 'color':
                this.scene.setBackgroundColor(color);
                break;
            case 'image':
                ImageLoader.load(image, (image) => {
                    this.scene.setBackgroundImage(image);
                });
                break;
            case 'skybox':
                ImageLoader.loadArray([
                    `${skybox}/px.jpg`, `${skybox}/nx.jpg`,
                    `${skybox}/py.jpg`, `${skybox}/ny.jpg`,
                    `${skybox}/pz.jpg`, `${skybox}/nz.jpg`,
                ], (images) => {
                    this.scene.setBackgroundCube(images);
                });
                break;
        }
    }
}

export { Dxy as default };
//# sourceMappingURL=dxy.js.map

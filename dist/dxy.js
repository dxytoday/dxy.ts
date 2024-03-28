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
    setComponent(index, value) {
        switch (index) {
            case 'x':
            case 0:
                this.x = value;
                break;
            case 'y':
            case 1:
                this.y = value;
                break;
            case 'z':
            case 2:
                this.z = value;
                break;
        }
        return this;
    }
    setFromArray(array, offset = 0) {
        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
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
    min(v) {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        this.z = Math.min(this.z, v.z);
        return this;
    }
    max(v) {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        this.z = Math.max(this.z, v.z);
        return this;
    }
    addVectors(l, r) {
        this.x = l.x + r.x;
        this.y = l.y + r.y;
        this.z = l.z + r.z;
        return this;
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
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
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
        return Math.sqrt(this.distanceToSq(v));
    }
    distanceToSq(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }
    maxComponent() {
        return Math.max(this.x, this.y, this.z);
    }
    clone() {
        return new Vector3().copy(this);
    }
}

class Constants {
    static CLEAR_MASK = 16384 | 256 | 1024;
    static VERTEX_SHADER = 35633;
    static FRAGMENT_SHADER = 35632;
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

let Helper$h = class Helper {
    static vector3 = new Vector3();
    static getGLType(constructor) {
        if (constructor === Int8Array) {
            return Constants.BYTE;
        }
        if (constructor === Uint8Array) {
            return Constants.UNSIGNED_BYTE;
        }
        if (constructor === Int16Array) {
            return Constants.SHORT;
        }
        if (constructor === Uint16Array) {
            return Constants.UNSIGNED_SHORT;
        }
        if (constructor === Uint32Array) {
            return Constants.UNSIGNED_INT;
        }
        if (constructor === Float32Array) {
            return Constants.FLOAT;
        }
        return Constants.FLOAT;
    }
};
class Attribute {
    array;
    itemSize;
    normalized;
    dataType;
    needsUpdate = false;
    constructor(array, itemSize, normalized = false) {
        this.array = array;
        this.itemSize = itemSize;
        this.normalized = normalized;
        this.dataType = Helper$h.getGLType(array.constructor);
    }
    get count() {
        return this.array.length / this.itemSize;
    }
    getX(index) {
        return this.array[index * this.itemSize];
    }
    getY(index) {
        return this.array[index * this.itemSize + 1];
    }
    getZ(index) {
        return this.array[index * this.itemSize + 2];
    }
    toVector3(index, target) {
        target.x = this.getX(index);
        target.y = this.getY(index);
        target.z = this.getZ(index);
        return target;
    }
    toBox3(target) {
        target.makeEmpty();
        for (let ii = 0, li = this.count; ii < li; ii++) {
            this.toVector3(ii, Helper$h.vector3);
            target.expandByPoint(Helper$h.vector3);
        }
        return target;
    }
    static createF3(array) {
        return new Attribute(new Float32Array(array), 3, false);
    }
    static createF2(array) {
        return new Attribute(new Float32Array(array), 2, false);
    }
}

class Box3 {
    min = new Vector3(+Infinity, +Infinity, +Infinity);
    max = new Vector3(-Infinity, -Infinity, -Infinity);
    makeEmpty() {
        this.min.x = this.min.y = this.min.z = +Infinity;
        this.max.x = this.max.y = this.max.z = -Infinity;
        return this;
    }
    isEmpty() {
        return (this.max.x < this.min.x) || (this.max.y < this.min.y) || (this.max.z < this.min.z);
    }
    getCenter(target) {
        return this.isEmpty() ? target.set(0, 0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
    }
    expandByPoint(point) {
        this.min.min(point);
        this.max.max(point);
        return this;
    }
    copy(box) {
        this.min.copy(box.min);
        this.max.copy(box.max);
        return this;
    }
}

let Helper$g = class Helper {
    static scale = new Vector3();
};
class Sphere {
    center = new Vector3(0, 0, 0);
    radius = -1;
    applyMatrix4(matrix) {
        this.center.applyMatrix4(matrix);
        matrix.extractScale(Helper$g.scale);
        const maxScale = Helper$g.scale.maxComponent();
        this.radius = this.radius * maxScale;
        return this;
    }
    copy(sphere) {
        this.center.copy(sphere.center);
        this.radius = sphere.radius;
        return this;
    }
}

let Helper$f = class Helper {
    static vector3 = new Vector3();
    static box3 = new Box3();
    static arrayNeedsUint32(array) {
        for (let ii = array.length - 1; ii >= 0; --ii) {
            if (array[ii] >= 65535) {
                return true;
            }
        }
        return false;
    }
};
class Geometry {
    attributes = {};
    groups = [];
    boundingSphere = new Sphere();
    indices;
    get position() {
        return this.getAttribute('position');
    }
    setIndices(array) {
        if (Helper$f.arrayNeedsUint32(array)) {
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
    computeBoundingSphere() {
        if (!this.position) {
            return;
        }
        const center = this.boundingSphere.center;
        this.position.toBox3(Helper$f.box3);
        Helper$f.box3.getCenter(center);
        let maxRadiusSq = -1;
        for (let ii = 0, il = this.position.count; ii < il; ii++) {
            this.position.toVector3(ii, Helper$f.vector3);
            maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSq(Helper$f.vector3));
        }
        this.boundingSphere.radius = Math.sqrt(maxRadiusSq);
    }
}

var vertexShader$3 = "#version 300 es\r\n\r\nin vec3 position;\r\nin vec3 normal;\r\nin vec2 uv;\r\n\r\nuniform mat3 normalMatrix;\r\nuniform mat4 modelMatrix;\r\nuniform mat4 viewMatrix;\r\nuniform mat4 projectionMatrix;\r\nuniform mat4 shadowMatrix;\r\n\r\nout vec2 vUV;\r\nout vec3 vNormal;\r\nout vec3 vPosition;\r\nout vec4 vShadowCoord;\r\n\r\nvoid main() {\r\n\r\n    vUV = uv;\r\n    vNormal = normalMatrix * normal;\r\n\r\n    vec4 mPosition = modelMatrix * vec4(position, 1);\r\n    vec4 mvPosition = viewMatrix * mPosition;\r\n\r\n    vShadowCoord = shadowMatrix * mPosition;\r\n    vPosition = mvPosition.xyz;\r\n\r\n    gl_Position = projectionMatrix * mvPosition;\r\n\r\n}\r\n";

var fragmentShader$3 = "#version 300 es\r\n\r\nprecision highp float;\r\nprecision highp int;\r\n\r\nout vec4 oColor;\r\n\r\nin vec2 vUV;\r\nin vec3 vNormal;\r\nin vec3 vPosition;\r\nin vec4 vShadowCoord;\r\n\r\nuniform bool useUV;\r\n\r\nuniform vec3 color;\r\nuniform float opacity;\r\n\r\nuniform sampler2D map;\r\nuniform bool useMap;\r\n\r\nuniform sampler2D shadowMap;\r\n\r\nuniform float roughness;\r\nuniform float metalness;\r\n\r\nuniform vec3 ambientLightColor;\r\n\r\nstruct DirectionalLight {\r\n\r\n    vec3 color;\r\n    vec3 direction;\r\n\r\n};\r\n\r\nuniform DirectionalLight directionalLight;\r\n\r\n#define RECIPROCAL_PI 0.3183098861837907\r\n#define EPSILON 1e-6\r\n\r\n#define saturate( a ) clamp( a, 0.0, 1.0 )\r\n\r\nfloat pow2(const in float x) {\r\n\r\n    return x * x;\r\n\r\n}\r\n\r\nfloat getShadow() {\r\n\r\n    vec3 shadowCoord = vShadowCoord.xyz / vShadowCoord.w;\r\n    shadowCoord.z -= 0.006f;\r\n\r\n    bool inFrustum = shadowCoord.x >= 0.0f && shadowCoord.x <= 1.0f && shadowCoord.y >= 0.0f && shadowCoord.y <= 1.0f;\r\n    float projectedDepth = texture(shadowMap, shadowCoord.xy).r;\r\n\r\n    return (inFrustum && projectedDepth <= shadowCoord.z) ? 0.0f : 1.0f;\r\n\r\n}\r\n\r\nvec3 BRDF_Lambert(const in vec3 diffuseColor) {\r\n\r\n    return RECIPROCAL_PI * diffuseColor;\r\n\r\n}\r\n\r\nvec3 F_Schlick(const in vec3 f0, const in float dotVH) {\r\n\r\n    float fresnel = exp2((-5.55473f * dotVH - 6.98316f) * dotVH);\r\n    return f0 * (1.0f - fresnel) + fresnel;\r\n\r\n}\r\n\r\nfloat D_GGX(const in float alpha, const in float dotNH) {\r\n\r\n    float a2 = pow2(alpha);\r\n\r\n    float denom = pow2(dotNH) * (a2 - 1.0f) + 1.0f;\r\n\r\n    return RECIPROCAL_PI * a2 / pow2(denom);\r\n\r\n}\r\n\r\nfloat V_GGX_SmithCorrelated(const in float alpha, const in float dotNL, const in float dotNV) {\r\n\r\n    float a2 = pow2(alpha);\r\n\r\n    float gv = dotNL * sqrt(a2 + (1.0f - a2) * pow2(dotNV));\r\n    float gl = dotNV * sqrt(a2 + (1.0f - a2) * pow2(dotNL));\r\n\r\n    return 0.5f / max(gv + gl, EPSILON);\r\n\r\n}\r\n\r\n// 使用 GGX 函数，金属高光有更真实的拖尾效果\r\nvec3 BRDF_GGX(const in vec3 L, const in vec3 V, const in vec3 N, const in vec3 f0, const in float roughness) {\r\n\r\n    float alpha = pow2(roughness);\r\n\r\n    vec3 H = normalize(L + V);\r\n\r\n    float dotNL = saturate(dot(N, L));\r\n    float dotNV = saturate(dot(N, V));\r\n    float dotNH = saturate(dot(N, H));\r\n    float dotVH = saturate(dot(V, H));\r\n\r\n    vec3 F = F_Schlick(f0, dotVH);\r\n\r\n    float D = D_GGX(alpha, dotNH);\r\n    float G = V_GGX_SmithCorrelated(alpha, dotNL, dotNV);\r\n\r\n    return F * (G * D);\r\n\r\n}\r\n\r\nvec3 PBR(const in vec3 materialColor) {\r\n\r\n    vec3 N = normalize(vNormal);\r\n    vec3 V = normalize(-vPosition);\r\n    vec3 L = normalize(directionalLight.direction);\r\n\r\n    float geometryRoughness = max(roughness, 0.0525f);\r\n\r\n    // 叠加表面梯度\r\n    vec3 dxy = max(abs(dFdx(N)), abs(dFdy(N)));\r\n    float gradient = max(max(dxy.x, dxy.y), dxy.z);\r\n    geometryRoughness = min(geometryRoughness + gradient, 1.0f);\r\n\r\n    // 材质的漫反射基础色\r\n    vec3 diffuseColor = materialColor * (1.0f - metalness);\r\n\r\n    // 材质的镜面反射基础色\r\n    vec3 specularColor = mix(vec3(0.04f), materialColor, metalness);\r\n\r\n    // 直接辐照度，来自灯光的辐照度\r\n    vec3 directIrradiance = directionalLight.color * saturate(dot(N, L));\r\n\r\n    // 阴影中的直接辐照度为 0\r\n    directIrradiance *= getShadow();\r\n\r\n    // 直接漫反射，来自灯光的漫反射，注意：BRDF 函数使用 GGX 版本，漫反射项忽略 Kd 系数\r\n    vec3 directDiffuse = directIrradiance * BRDF_Lambert(diffuseColor);\r\n\r\n    // 直接镜面反射，来自灯光的镜面反射\r\n    vec3 directSpecular = directIrradiance * BRDF_GGX(L, V, N, specularColor, geometryRoughness);\r\n\r\n    // 间接辐照度，来自环境的辐照度 = 环境光 + IBL\r\n    vec3 indirectIrradiance = ambientLightColor;\r\n\r\n    // 间接漫反射，来自环境的漫反射\r\n    vec3 indirectDiffuse = indirectIrradiance * BRDF_Lambert(diffuseColor);\r\n\r\n    // 最终颜色 = 直接漫反射 + 直接镜面反射 + 间接漫反射 + 间接镜面反射\r\n    return directDiffuse + directSpecular + indirectDiffuse;\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n    vec4 finalColor = vec4(color, opacity);\r\n\r\n    vec4 noneColor = vec4(1, 1, 1, 1);\r\n    vec4 mapColor = texture(map, vUV);\r\n    float mapColorAmount = useMap && useUV ? 1.0f : 0.0f;\r\n    finalColor *= mix(noneColor, mapColor, mapColorAmount);\r\n\r\n    finalColor.rgb = PBR(finalColor.rgb);\r\n\r\n    // linear sRGB 转换到 sRGB\r\n\r\n    vec3 greater = pow(finalColor.rgb, vec3(0.41666f)) * 1.055f - vec3(0.055f);\r\n    vec3 lessAndEqual = finalColor.rgb * 12.92f;\r\n    vec3 flag = vec3(lessThanEqual(finalColor.rgb, vec3(0.0031308f)));\r\n\r\n    oColor.rgb = mix(greater, lessAndEqual, flag);\r\n    oColor.a = finalColor.a;\r\n\r\n}\r\n";

let Helper$e = class Helper {
    static fromStyle(style) {
        let execArray;
        if (execArray = /^(\w+)\(([^\)]*)\)/.exec(style)) {
            return Helper.fromRGB(execArray);
        }
        if (execArray = /^\#([A-Fa-f\d]+)$/.exec(style)) {
            return Helper.fromHex(execArray);
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
};
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
        this.r = Helper$e.SRGBToLinear(r);
        this.g = Helper$e.SRGBToLinear(g);
        this.b = Helper$e.SRGBToLinear(b);
        return this;
    }
    setStyle(style) {
        const [r, g, b] = Helper$e.fromStyle(style);
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
    clone() {
        return new Color().copy(this);
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

let Helper$d = class Helper {
    static up = new Vector3(0, 1, 0);
    static scale = new Vector3();
    static xAxis = new Vector3();
    static yAxis = new Vector3();
    static zAxis = new Vector3();
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
    extractPosition(target) {
        target.x = this.elements[12];
        target.y = this.elements[13];
        target.z = this.elements[14];
        return target;
    }
    extractRotation(target) {
        const me = this.elements.slice();
        this.extractScale(Helper$d.scale);
        me[0] /= Helper$d.scale.x;
        me[1] /= Helper$d.scale.x;
        me[2] /= Helper$d.scale.x;
        me[4] /= Helper$d.scale.y;
        me[5] /= Helper$d.scale.y;
        me[6] /= Helper$d.scale.y;
        me[8] /= Helper$d.scale.z;
        me[9] /= Helper$d.scale.z;
        me[10] /= Helper$d.scale.z;
        const trace = me[0] + me[5] + me[10];
        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);
            target.w = 0.25 / s;
            target.x = (me[6] - me[9]) * s;
            target.y = (me[8] - me[2]) * s;
            target.z = (me[1] - me[4]) * s;
        }
        else if (me[0] > me[5] && me[0] > me[10]) {
            const s = 2.0 * Math.sqrt(1.0 + me[0] - me[5] - me[10]);
            target.w = (me[6] - me[9]) / s;
            target.x = 0.25 * s;
            target.y = (me[4] + me[1]) / s;
            target.z = (me[8] + me[2]) / s;
        }
        else if (me[5] > me[10]) {
            const s = 2.0 * Math.sqrt(1.0 + me[5] - me[0] - me[10]);
            target.w = (me[8] - me[2]) / s;
            target.x = (me[4] + me[1]) / s;
            target.y = 0.25 * s;
            target.z = (me[9] + me[6]) / s;
        }
        else {
            const s = 2.0 * Math.sqrt(1.0 + me[10] - me[0] - me[5]);
            target.w = (me[1] - me[4]) / s;
            target.x = (me[8] + me[2]) / s;
            target.y = (me[9] + me[6]) / s;
            target.z = 0.25 * s;
        }
        return target;
    }
    extractScale(target) {
        this.extractBasis(Helper$d.xAxis, Helper$d.yAxis, Helper$d.zAxis);
        target.x = Helper$d.xAxis.length();
        target.y = Helper$d.yAxis.length();
        target.z = Helper$d.zAxis.length();
        return target;
    }
    extractBasis(xAxis, yAxis, zAxis) {
        xAxis.setFromArray(this.elements, 0);
        yAxis.setFromArray(this.elements, 4);
        zAxis.setFromArray(this.elements, 8);
        return this;
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
    makeOrthographic(left, right, top, bottom, near, far) {
        const te = this.elements;
        const w = 1.0 / (right - left);
        const h = 1.0 / (top - bottom);
        const p = 1.0 / (far - near);
        const x = (right + left) * w;
        const y = (top + bottom) * h;
        const z = (far + near) * p;
        const zInv = -2 * p;
        te[0] = 2 * w;
        te[4] = 0;
        te[8] = 0;
        te[12] = -x;
        te[1] = 0;
        te[5] = 2 * h;
        te[9] = 0;
        te[13] = -y;
        te[2] = 0;
        te[6] = 0;
        te[10] = zInv;
        te[14] = -z;
        te[3] = 0;
        te[7] = 0;
        te[11] = 0;
        te[15] = 1;
        return this;
    }
    makeLookAt(eye, target) {
        Helper$d.zAxis.subVectors(eye, target);
        if (!Helper$d.zAxis.length()) {
            Helper$d.zAxis.z = 1;
        }
        Helper$d.zAxis.normalize();
        Helper$d.xAxis.crossVectors(Helper$d.up, Helper$d.zAxis);
        if (!Helper$d.xAxis.lengthSq()) {
            Helper$d.zAxis.z += 0.0001;
            Helper$d.zAxis.normalize();
            Helper$d.xAxis.crossVectors(Helper$d.up, Helper$d.zAxis);
        }
        Helper$d.xAxis.normalize();
        Helper$d.yAxis.crossVectors(Helper$d.zAxis, Helper$d.xAxis);
        this.elements[0] = Helper$d.xAxis.x;
        this.elements[1] = Helper$d.xAxis.y;
        this.elements[2] = Helper$d.xAxis.z;
        this.elements[4] = Helper$d.yAxis.x;
        this.elements[5] = Helper$d.yAxis.y;
        this.elements[6] = Helper$d.yAxis.z;
        this.elements[8] = Helper$d.zAxis.x;
        this.elements[9] = Helper$d.zAxis.y;
        this.elements[10] = Helper$d.zAxis.z;
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

class Material {
    uniforms = {};
    name = '';
    transparent = false;
    backfaceCulling = true;
    vertexShader = '';
    fragmentShader = '';
    getUniform(name) {
        return this.uniforms[name];
    }
    onBeforRender(scene, mesh, camera) { }
}

let Helper$c = class Helper {
    static matrix4 = new Matrix4();
};
class PhysicalMaterial extends Material {
    opacity = 1;
    color = new Color(1, 1, 1);
    map;
    roughness = 1;
    roughnessMap;
    metalness = 0;
    metalnessMap;
    constructor() {
        super();
        this.vertexShader = vertexShader$3;
        this.fragmentShader = fragmentShader$3;
        this.uniforms = {
            color: { value: new Color(1, 1, 1) },
            opacity: { value: this.opacity },
            map: { value: this.map },
            useMap: { value: !!this.map },
            roughness: { value: this.roughness },
            roughnessMap: { value: this.roughnessMap },
            useRoughnessMap: { value: !!this.roughnessMap },
            metalness: { value: this.metalness },
            metalnessMap: { value: this.metalnessMap },
            useMetalnessMap: { value: !!this.metalnessMap },
            modelMatrix: { value: new Matrix4() },
            viewMatrix: { value: new Matrix4() },
            normalMatrix: { value: new Matrix3() },
            projectionMatrix: { value: new Matrix4() },
            useUV: { value: false },
            ambientLightColor: { value: new Color() },
            directionalLight: {
                value: {
                    color: new Color(),
                    direction: new Vector3(),
                }
            },
            shadowMap: { value: undefined },
            shadowMatrix: { value: new Matrix4() },
        };
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
        this.uniforms.modelMatrix.value.copy(mesh.worldMatrix);
        this.uniforms.viewMatrix.value.copy(camera.viewMatrix);
        this.uniforms.projectionMatrix.value.copy(camera.projectionMatrix);
        Helper$c.matrix4.multiplyMatrices(mesh.worldMatrix, camera.viewMatrix);
        this.uniforms.normalMatrix.value.makeNormalMatrix(Helper$c.matrix4);
        this.uniforms.useUV.value = mesh.geometry.hasAttribute('uv');
        this.uniforms.ambientLightColor.value.copy(scene.ambientLight.lightColor);
        this.uniforms.directionalLight.value.color.copy(scene.directionalLight.lightColor);
        this.uniforms.directionalLight.value.direction.copy(scene.directionalLight.lightDirection);
        this.uniforms.shadowMap.value = scene.directionalLight.shadow.texture;
        this.uniforms.shadowMatrix.value.copy(scene.directionalLight.shadow.matrix);
    }
}

let Helper$b = class Helper {
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
};
class Quaternion {
    x;
    y;
    z;
    w;
    _eulerX = 0;
    _eulerY = 0;
    _eulerZ = 0;
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.updateEuler();
    }
    set eulerX(x) {
        this._eulerX = x;
        this.setFromEuler();
    }
    set eulerY(y) {
        this._eulerY = y;
        this.setFromEuler();
    }
    set eulerZ(z) {
        this._eulerZ = z;
        this.setFromEuler();
    }
    get eulerX() {
        return this._eulerX;
    }
    get eulerY() {
        return this._eulerY;
    }
    get eulerZ() {
        return this._eulerZ;
    }
    setFromArray(array, offset = 0) {
        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        this.w = array[offset + 3];
        this.updateEuler();
        return this;
    }
    setFromEuler(x = this._eulerX, y = this._eulerY, z = this._eulerZ) {
        this._eulerX = x;
        this._eulerY = y;
        this._eulerZ = z;
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
    updateEuler() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
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
        const m11 = (1 - (yy + zz));
        const m12 = (xy - wz);
        const m13 = (xz + wy);
        const m22 = (1 - (xx + zz));
        const m23 = (yz - wx);
        const m32 = (yz + wx);
        const m33 = (1 - (xx + yy));
        this._eulerY = Math.asin(Helper$b.clamp(m13, -1, 1));
        if (Math.abs(m13) < 0.9999999) {
            this._eulerX = Math.atan2(-m23, m33);
            this._eulerZ = Math.atan2(-m12, m11);
        }
        else {
            this._eulerX = Math.atan2(m32, m22);
            this._eulerZ = 0;
        }
        return this;
    }
}

class TRSObject {
    position = new Vector3(0, 0, 0);
    rotation = new Quaternion(0, 0, 0, 1);
    scale = new Vector3(1, 1, 1);
    matrix = new Matrix4();
    worldMatrix = new Matrix4();
    parent;
    children = [];
    name = '';
    visible = true;
    updateMatrix() {
        this.matrix.compose(this.position, this.rotation, this.scale);
        this.worldMatrix.copy(this.matrix);
        if (this.parent) {
            this.worldMatrix.multiply(this.parent.worldMatrix);
        }
        for (const child of this.children) {
            child.updateMatrix();
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
}

class Mesh extends TRSObject {
    geometry;
    material;
    constructor(geometry = new Geometry(), material = new PhysicalMaterial()) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
}

class Texture {
    magFilter = Constants.LINEAR;
    minFilter = Constants.LINEAR_MIPMAP_LINEAR;
    wrapS = Constants.REPEAT;
    wrapT = Constants.REPEAT;
    needsUpdate = false;
}

class ImageTexture extends Texture {
    image;
    constructor(image) {
        super();
        this.image = image;
    }
}

let Helper$a = class Helper {
    static textDecoder = new TextDecoder();
    static filters = {
        9728: Constants.NEAREST,
        9729: Constants.LINEAR,
        9984: Constants.NEAREST_MIPMAP_NEAREST,
        9985: Constants.LINEAR_MIPMAP_NEAREST,
        9986: Constants.NEAREST_MIPMAP_LINEAR,
        9987: Constants.LINEAR_MIPMAP_LINEAR,
    };
    static wraps = {
        10497: Constants.REPEAT,
        33071: Constants.CLAMP_TO_EDGE,
        33648: Constants.MIRRORED_REPEAT,
    };
    static sizes = {
        'SCALAR': 1,
        'VEC2': 2,
        'VEC3': 3,
        'VEC4': 4,
        'MAT2': 2,
        'MAT3': 9,
        'MAT4': 16,
    };
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
                    console.warn(`DXY.GLBLoader : ${ii} 个几何体缺少索引数据 . `);
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
                console.warn(`DXY.GLBLoader : 第 ${ii} 个几何体缺少属性 . `);
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
            const attribute = Helper.mergeAttributes(attributes);
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
                console.warn(`DXY.GLBLoader : 第 ${ii} 个缓冲属性类型错误 . `);
                return undefined;
            }
            arrayLen += attribute.array.length;
        }
        const array = Helper.createTypedArray(dataType, arrayLen);
        let offset = 0;
        for (const attribute of attributes) {
            array.set(attribute.array, offset);
            offset += attribute.array.length;
        }
        return new Attribute(array, itemSize, normalized);
    }
};
class GBLParser {
    url;
    objectDef;
    bufferData;
    geometryCache = new Map();
    material;
    constructor(url) {
        this.url = url;
        this.objectDef = {};
    }
    async parse() {
        await this.requestData();
        let scene;
        if (this.objectDef.scenes) {
            scene = await this.loadScene(this.objectDef.scene);
        }
        return scene;
    }
    async requestData() {
        const response = await fetch(this.url);
        const data = await response.arrayBuffer();
        const dataView = new DataView(data);
        const length = dataView.getUint32(8, true);
        let index = 12, chunkLength, chunkType;
        let objectDef;
        let bufferData;
        while (index < length) {
            chunkLength = dataView.getUint32(index, true);
            index += 4;
            chunkType = dataView.getUint32(index, true);
            index += 4;
            if (chunkType === 0x4E4F534A) {
                const defData = new Uint8Array(data, index, chunkLength);
                objectDef = Helper$a.textDecoder.decode(defData);
            }
            else if (chunkType === 0x004E4942) {
                bufferData = data.slice(index, index + chunkLength);
            }
            index += chunkLength;
        }
        this.bufferData = bufferData;
        if (objectDef) {
            this.objectDef = JSON.parse(objectDef);
        }
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
        if (nodeDef.translation) {
            node.position.setFromArray(nodeDef.translation);
        }
        if (nodeDef.rotation) {
            node.rotation.setFromArray(nodeDef.rotation);
        }
        if (nodeDef.scale) {
            node.scale.setFromArray(nodeDef.scale);
        }
        if (nodeDef.children) {
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
        if (meshDef.instance) {
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
                geometry = Helper$a.mergeGeometries(geometries);
                geometry.computeBoundingSphere();
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
            const key = Helper$a.getGeometryKey(primitive);
            geometry = this.geometryCache.get(key);
            if (!geometry) {
                geometry = new Geometry();
                for (const key in primitive.attributes) {
                    const attributeName = Helper$a.getAttributeName(key);
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
                geometry.computeBoundingSphere();
                this.geometryCache.set(key, geometry);
            }
            keys.push(key);
            geometries.push(geometry);
        }
        return geometries;
    }
    loadAttribute(index) {
        const accessorDef = this.objectDef.accessors[index];
        const itemSize = Helper$a.sizes[accessorDef.type] || 0;
        const type = accessorDef.componentType;
        const count = accessorDef.count;
        const offset = accessorDef.byteOffset || 0;
        const normalized = accessorDef.normalized === true;
        const length = count * itemSize;
        const buffer = this.loadBufferView(accessorDef.bufferView);
        const typedArray = Helper$a.createTypedArray(type, buffer, offset, length);
        return new Attribute(typedArray, itemSize, normalized);
    }
    async loadMaterials(primitives) {
        const materials = [];
        for (const primitive of primitives) {
            if (primitive.material === undefined) {
                if (!this.material) {
                    this.material = new PhysicalMaterial();
                }
                materials.push(this.material);
                continue;
            }
            const materialDef = this.objectDef.materials[primitive.material];
            if (materialDef.instance) {
                materials.push(materialDef.instance);
                continue;
            }
            const material = new PhysicalMaterial();
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
        const texture = new ImageTexture(imageDef.instance);
        textureDef.instance = texture;
        const samplerDef = this.objectDef.samplers[textureDef.sampler];
        texture.magFilter = Helper$a.filters[samplerDef.magFilter] || texture.magFilter;
        texture.minFilter = Helper$a.filters[samplerDef.minFilter] || texture.minFilter;
        texture.wrapS = Helper$a.wraps[samplerDef.wrapS] || texture.wrapS;
        texture.wrapT = Helper$a.wraps[samplerDef.wrapT] || texture.wrapT;
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
    static async load(url) {
        return new GBLParser(url).parse();
    }
}

class Light {
    color = new Color(1, 1, 1);
    intensity = 1;
    lightColor = new Color();
    update() {
        this.lightColor.copy(this.color);
        this.lightColor.multiplyScalar(this.intensity);
    }
}

class AmbientLight extends Light {
}

class Plane {
    normal = new Vector3(1, 0, 0);
    constant = 0;
    setComponents(x, y, z, w) {
        this.normal.set(x, y, z);
        this.constant = w;
        return this;
    }
    normalize() {
        const inverseNormalLength = 1.0 / this.normal.length();
        this.normal.multiplyScalar(inverseNormalLength);
        this.constant *= inverseNormalLength;
        return this;
    }
    distanceToPoint(point) {
        return this.normal.dot(point) + this.constant;
    }
}

class Frustum {
    planes = [new Plane(), new Plane(), new Plane(), new Plane(), new Plane(), new Plane()];
    setFromProjectionMatrix(m) {
        const planes = this.planes;
        const me = m.elements;
        const me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
        const me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
        const me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
        const me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];
        planes[0].setComponents(me3 - me0, me7 - me4, me11 - me8, me15 - me12).normalize();
        planes[1].setComponents(me3 + me0, me7 + me4, me11 + me8, me15 + me12).normalize();
        planes[2].setComponents(me3 + me1, me7 + me5, me11 + me9, me15 + me13).normalize();
        planes[3].setComponents(me3 - me1, me7 - me5, me11 - me9, me15 - me13).normalize();
        planes[4].setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14).normalize();
        planes[5].setComponents(me3 + me2, me7 + me6, me11 + me10, me15 + me14).normalize();
        return this;
    }
    intersectsSphere(sphere) {
        const planes = this.planes;
        const center = sphere.center;
        const negRadius = -sphere.radius;
        for (let i = 0; i < 6; i++) {
            const distance = planes[i].distanceToPoint(center);
            if (distance < negRadius) {
                return false;
            }
        }
        return true;
    }
}

let Helper$9 = class Helper {
    static matrix4 = new Matrix4();
    static sphere = new Sphere();
};
class Camera extends TRSObject {
    viewMatrix = new Matrix4();
    projectionMatrix = new Matrix4();
    frustum = new Frustum();
    constructor() {
        super();
        this.position.set(0, 1, 0);
    }
    updateMatrix() {
        super.updateMatrix();
        this.viewMatrix.copy(this.worldMatrix).invert();
        Helper$9.matrix4.multiplyMatrices(this.viewMatrix, this.projectionMatrix);
        this.frustum.setFromProjectionMatrix(Helper$9.matrix4);
    }
    frustumCulling(mesh) {
        Helper$9.sphere.copy(mesh.geometry.boundingSphere);
        Helper$9.sphere.applyMatrix4(mesh.worldMatrix);
        return this.frustum.intersectsSphere(Helper$9.sphere);
    }
}

class OrthographicCamera extends Camera {
    left;
    right;
    top;
    bottom;
    near;
    far;
    constructor(left = -50, right = 50, top = 50, bottom = -50, near = 1, far = 200) {
        super();
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
        this.near = near;
        this.far = far;
        this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
        const dx = (this.right - this.left) / 2;
        const dy = (this.top - this.bottom) / 2;
        const cx = (this.right + this.left) / 2;
        const cy = (this.top + this.bottom) / 2;
        const left = cx - dx;
        const right = cx + dx;
        const top = cy + dy;
        const bottom = cy - dy;
        this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far);
    }
}

var vertexShader$2 = "#version 300 es\r\n\r\nin vec3 position;\r\n\r\nuniform mat4 modelViewMatrix;\r\nuniform mat4 projectionMatrix;\r\n\r\nout vec2 vHighPrecisionZW;\r\n\r\nvoid main() {\r\n\r\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);\r\n\r\n    vHighPrecisionZW = gl_Position.zw;\r\n\r\n}";

var fragmentShader$2 = "#version 300 es\r\n\r\nprecision highp float;\r\nprecision highp int;\r\n\r\nin vec2 vHighPrecisionZW;\r\n\r\nuniform float opacity;\r\n\r\nout vec4 oColor;\r\n\r\nvoid main() {\r\n\r\n    float fragCoordZ = 0.5f * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5f;\r\n\r\n    oColor = vec4(vec3(1.0f - fragCoordZ), opacity);\r\n\r\n}\r\n";

class DepthMaterial extends Material {
    opacity = 1;
    constructor() {
        super();
        this.vertexShader = vertexShader$2;
        this.fragmentShader = fragmentShader$2;
        this.uniforms.opacity = { value: this.opacity };
        this.uniforms.modelViewMatrix = { value: new Matrix4() };
        this.uniforms.projectionMatrix = { value: new Matrix4() };
    }
    onBeforRender(scene, mesh, camera) {
        this.uniforms.opacity.value = this.opacity;
        this.uniforms.modelViewMatrix.value.multiplyMatrices(mesh.worldMatrix, camera.viewMatrix);
        this.uniforms.projectionMatrix.value.copy(camera.projectionMatrix);
    }
}

class DataTexture extends Texture {
    constructor() {
        super();
        this.magFilter = Constants.NEAREST;
        this.minFilter = Constants.NEAREST;
        this.wrapS = Constants.CLAMP_TO_EDGE;
        this.wrapT = Constants.CLAMP_TO_EDGE;
    }
}

let Helper$8 = class Helper {
    static matrix4 = new Matrix4();
};
class Shadow {
    size = 1024;
    camera = new OrthographicCamera();
    material = new DepthMaterial();
    texture = new DataTexture();
    matrix = new Matrix4();
    updateShadowMatrix(light) {
        const camera = this.camera;
        camera.position.copy(light.position);
        Helper$8.matrix4.makeLookAt(light.position, light.target);
        Helper$8.matrix4.extractRotation(camera.rotation);
        camera.updateMatrix();
        this.matrix.set(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);
        Helper$8.matrix4.multiplyMatrices(camera.viewMatrix, camera.projectionMatrix);
        this.matrix.multiplyMatrices(Helper$8.matrix4, this.matrix);
    }
}

let Helper$7 = class Helper {
    static matrix3 = new Matrix3();
};
class DirectionalLight extends Light {
    position = new Vector3(0, 1, 0);
    target = new Vector3(0, 0, 0);
    shadow = new Shadow();
    lightDirection = new Vector3();
    update(camera) {
        super.update();
        this.lightDirection.copy(this.position);
        this.lightDirection.sub(this.target);
        if (camera) {
            Helper$7.matrix3.setFromMatrix4(camera.viewMatrix);
            this.lightDirection.applyMatrix3(Helper$7.matrix3);
        }
    }
}

var vertexShader$1 = "#version 300 es\r\n\r\nin vec3 position;\r\nin vec2 uv;\r\n\r\nout vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n    vUv = uv;\r\n\r\n    // ndc 值域为 -1 到 +1\r\n    // 对应 webgl 深度值的 0 到 1\r\n    // z 值为 1 确保转换到 webgl 有效深度值的最远处\r\n    gl_Position = vec4(position.xy, 1, 1);\r\n\r\n}";

var fragmentShader$1 = "#version 300 es\r\n\r\nprecision highp float;\r\nprecision highp int;\r\n\r\nin vec2 vUv;\r\n\r\nuniform sampler2D map;\r\n\r\nout vec4 oColor;\r\n\r\nvoid main() {\r\n\r\n    oColor = texture(map, vUv);\r\n\r\n}";

class ImageMaterial extends Material {
    constructor() {
        super();
        this.vertexShader = vertexShader$1;
        this.fragmentShader = fragmentShader$1;
        this.uniforms.map = { value: undefined };
    }
    get map() {
        return this.uniforms.map.value;
    }
    set map(map) {
        this.uniforms.map.value = map;
    }
}

var vertexShader = "#version 300 es\r\n\r\nin vec3 position;\r\nin vec2 uv;\r\n\r\nuniform mat4 viewMatrix;\r\nuniform mat4 projectionMatrix;\r\n\r\nout vec2 vUv;\r\nout vec3 v_position;\r\n\r\nvoid main() {\r\n\r\n    vUv = uv;\r\n\r\n    v_position = normalize(position);\r\n\r\n    vec4 mvPosition = viewMatrix * vec4(position, 0);\r\n    mvPosition.w = 1.0f;\r\n\r\n    gl_Position = projectionMatrix * mvPosition;\r\n\r\n    // ndc 值域为 -1 到 +1，对应 webgl 深度值的 0 到 1\r\n    // z 值为 w 确保转换到 webgl 有效深度值的最远处\r\n    gl_Position.z = gl_Position.w;\r\n\r\n}";

var fragmentShader = "#version 300 es\r\n\r\nprecision highp float;\r\nprecision highp int;\r\n\r\nin vec3 v_position;\r\n\r\nuniform samplerCube cube;\r\n\r\nout vec4 oColor;\r\n\r\nvoid main() {\r\n\r\n    oColor = texture(cube, v_position);\r\n\r\n}";

class CubeMaterial extends Material {
    constructor() {
        super();
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;
        this.uniforms.cube = { value: undefined };
        this.uniforms.viewMatrix = { value: new Matrix4() };
        this.uniforms.projectionMatrix = { value: new Matrix4() };
    }
    get cube() {
        return this.uniforms.cube.value;
    }
    set cube(cube) {
        this.uniforms.cube.value = cube;
    }
    onBeforRender(scene, mesh, camera) {
        this.uniforms.viewMatrix.value.copy(camera.viewMatrix);
        this.uniforms.projectionMatrix.value.copy(camera.projectionMatrix);
    }
}

let Helper$6 = class Helper {
    static COLOR = 0;
    static IMAGE = 1;
    static CUBE = 2;
    static createImageMesh() {
        const vertices = [-1, 1, -1, -1, 1, 1, -1, -1, 1, -1, 1, 1];
        const uvs = [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1];
        const geometry = new Geometry();
        geometry.setAttribute('position', Attribute.createF2(vertices));
        geometry.setAttribute('uv', Attribute.createF2(uvs));
        return new Mesh(geometry, new ImageMaterial());
    }
    static createCubeMesh() {
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
        const geometry = new Geometry();
        geometry.setAttribute('position', Attribute.createF3(vertices));
        return new Mesh(geometry, new CubeMaterial());
    }
};
class Scene extends TRSObject {
    backgroundColor = new Color(0, 0, 0);
    backgroundImage = Helper$6.createImageMesh();
    backgroundCube = Helper$6.createCubeMesh();
    bgType = Helper$6.COLOR;
    ambientLight = new AmbientLight();
    directionalLight = new DirectionalLight();
    updateLights(camera) {
        this.ambientLight.update();
        this.directionalLight.update(camera);
    }
    setBackgroundColor(color) {
        this.backgroundColor.setStyle(color);
        this.bgType = Helper$6.COLOR;
    }
    setBackgroundImage(texture) {
        const material = this.backgroundImage.material;
        material.map = texture;
        this.bgType = Helper$6.IMAGE;
    }
    setBackgroundCube(cubeTexture) {
        const material = this.backgroundCube.material;
        material.cube = cubeTexture;
        this.bgType = Helper$6.CUBE;
    }
    getBackground() {
        switch (this.bgType) {
            case Helper$6.COLOR: return this.backgroundColor;
            case Helper$6.IMAGE: return this.backgroundImage;
            case Helper$6.CUBE: return this.backgroundCube;
        }
        return this.backgroundColor;
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
    clone() {
        return new Vector4().copy(this);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
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
    frameBuffer = null;
    maxTextures;
    textureUnits = 0;
    textureUnit = 0;
    texture2D = null;
    textureCubeMap = null;
    frontFace = false;
    stateCache = new Map();
    constructor(gl) {
        this.gl = gl;
        this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
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
            console.warn(`DXY.WebGLState : 纹理单元超过了最大限制 ${textureUnits} . `);
        }
        this.textureUnits++;
        return textureUnits;
    }
    activeTexture(unit) {
        if (this.textureUnit !== unit) {
            this.gl.activeTexture(this.gl.TEXTURE0 + unit);
            this.textureUnit = unit;
        }
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
    bindFramebuffer(target, frameBuffer) {
        if (target === this.gl.FRAMEBUFFER && this.frameBuffer !== frameBuffer) {
            this.frameBuffer = frameBuffer;
            this.gl.bindFramebuffer(target, frameBuffer);
            return;
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
        }
        else {
            this.disable(this.gl.CULL_FACE);
        }
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

let Helper$5 = class Helper {
    static toUniforms(gl, info, location, uniforms) {
        Helper.createUniform(gl, info, location, info.name, uniforms);
    }
    static createUniform(gl, info, location, path, uniforms) {
        const dotIndex = path.indexOf('.');
        const braIndex = path.indexOf('[');
        if (dotIndex !== -1 &&
            braIndex !== -1 &&
            braIndex < dotIndex) {
            Helper.createArrayStruct(gl, info, location, path, uniforms);
        }
        else if (dotIndex !== -1) {
            Helper.createStruct(gl, info, location, path, uniforms);
        }
        else if (braIndex !== -1) {
            Helper.createArray(gl, info, location, path, uniforms);
        }
        else {
            Helper.createSingle(gl, info, location, path, uniforms);
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
        Helper.createUniform(gl, info, location, name, struct.uniforms);
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
        Helper.createSingle(gl, info, location, path, struct.uniforms);
    }
};
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
        Helper$5.toUniforms(gl, info, location, uniforms);
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

class CubeTexture extends Texture {
    images;
    constructor(images) {
        super();
        this.images = images;
    }
}

class WebGLAttribute {
    gl;
    location;
    name;
    enableVAOs = new Set();
    pointerVAOs = new Map();
    constructor(gl, location, name) {
        this.gl = gl;
        this.location = location;
        this.name = name;
    }
    isEnable(vao) {
        return this.enableVAOs.has(vao);
    }
    enable(vao) {
        if (this.isEnable(vao)) {
            return;
        }
        this.gl.enableVertexAttribArray(this.location);
        this.enableVAOs.add(vao);
    }
    disable(vao) {
        if (!this.isEnable(vao)) {
            return;
        }
        this.gl.disableVertexAttribArray(this.location);
        this.enableVAOs.delete(vao);
    }
    bind(attribute, vao, buffer) {
        const itemSize = attribute.itemSize;
        const dataType = attribute.dataType;
        const normalized = attribute.normalized;
        let bufferPointer = this.pointerVAOs.get(vao);
        if (!bufferPointer) {
            bufferPointer = {};
            this.pointerVAOs.set(vao, bufferPointer);
            this.enable(vao);
        }
        if (bufferPointer.buffer === buffer &&
            bufferPointer.size === itemSize &&
            bufferPointer.type == dataType &&
            bufferPointer.normalized === normalized) {
            return;
        }
        bufferPointer.buffer = buffer;
        bufferPointer.size = itemSize;
        bufferPointer.type = dataType;
        bufferPointer.normalized = normalized;
        this.gl.vertexAttribPointer(this.location, itemSize, dataType, normalized, 0, 0);
    }
}

let Helper$4 = class Helper {
    static renderItems = [];
    static mallocRenderItem(mesh, geometry, material, group) {
        const item = this.renderItems.shift() || {};
        item.mesh = mesh;
        item.geometry = geometry;
        item.material = material;
        item.group = group;
        return item;
    }
    static releaseRenderItem(items) {
        for (const item of items) {
            item.mesh = undefined;
            item.geometry = undefined;
            item.material = undefined;
            item.group = undefined;
            Helper.renderItems.push(item);
        }
        items.length = 0;
    }
    static setLineNumber(source) {
        function fn(lineContent, lineIndex) {
            return `${lineIndex + 1}: ${lineContent}`;
        }
        return source.split('\n').map(fn).join('\n');
    }
};
class WebGLCache {
    gl;
    frameBuffers = new Map();
    textures = new Map();
    programs = new Map();
    shaders = new Map();
    attributes = new Map();
    uniforms = new Map();
    buffers = new Map();
    vaos = new Map();
    constructor(gl) {
        this.gl = gl;
    }
    mallocRenderItem(mesh, geometry, material, group) {
        return Helper$4.mallocRenderItem(mesh, geometry, material, group);
    }
    releaseRenderItem(items) {
        Helper$4.releaseRenderItem(items);
    }
    getFrameBuffer(shadow) {
        return this.frameBuffers.get(shadow);
    }
    acquireFrameBuffer(shadow) {
        let frameBuffer = this.frameBuffers.get(shadow);
        if (!frameBuffer) {
            frameBuffer = this.gl.createFramebuffer();
            this.frameBuffers.set(shadow, frameBuffer);
        }
        return frameBuffer;
    }
    getTexture(texture) {
        return this.textures.get(texture);
    }
    acquireTexture(texture) {
        let webglTexture = this.textures.get(texture);
        if (webglTexture === undefined) {
            webglTexture = this.gl.createTexture();
            this.textures.set(texture, webglTexture);
        }
        return webglTexture;
    }
    acquireShader(source, type) {
        let shader = this.shaders.get(source);
        if (!shader) {
            shader = this.gl.createShader(type);
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);
            const compiled = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
            if (!compiled) {
                const reminder = 'DXY.WebGLCache : 编译着色器代码错误 .';
                const lastError = this.gl.getShaderInfoLog(shader);
                source = Helper$4.setLineNumber(source);
                throw new Error([reminder, lastError, source].join('\n'));
            }
            this.shaders.set(source, shader);
        }
        return shader;
    }
    acquireProgram(material) {
        const materialClass = material.constructor;
        let program = this.programs.get(materialClass);
        if (!program) {
            const vertexShader = this.acquireShader(material.vertexShader, this.gl.VERTEX_SHADER);
            const fragmentShader = this.acquireShader(material.fragmentShader, this.gl.FRAGMENT_SHADER);
            program = this.gl.createProgram();
            this.gl.attachShader(program, vertexShader);
            this.gl.attachShader(program, fragmentShader);
            this.gl.linkProgram(program);
            const linked = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
            if (!linked) {
                const reminder = 'DXY.WebGLCache : 链接着色器程序错误 . ';
                const lastError = this.gl.getProgramInfoLog(program);
                throw new Error([reminder, lastError].join('\n'));
            }
            this.programs.set(materialClass, program);
        }
        return program;
    }
    acquireAttributes(program) {
        let attributes = this.attributes.get(program);
        if (!attributes) {
            attributes = [];
            const count = this.gl.getProgramParameter(program, this.gl.ACTIVE_ATTRIBUTES);
            for (let ii = 0; ii < count; ii++) {
                const info = this.gl.getActiveAttrib(program, ii);
                const location = this.gl.getAttribLocation(program, info.name);
                const attribute = new WebGLAttribute(this.gl, location, info.name);
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
    acquireVertexArray(geometry) {
        let vao = this.vaos.get(geometry);
        if (vao === undefined) {
            vao = this.gl.createVertexArray();
            this.vaos.set(geometry, vao);
        }
        return vao;
    }
    getBuffer(attribute) {
        return this.buffers.get(attribute);
    }
    acquireBuffer(attribute) {
        let buffer = this.buffers.get(attribute);
        if (!buffer) {
            buffer = this.gl.createBuffer();
            this.buffers.set(attribute, buffer);
        }
        return buffer;
    }
}

let Helper$3 = class Helper {
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
        const context = canvas.getContext('webgl2', Helper.attributes);
        if (!context) {
            throw new Error('DXY.WebGLRenderer : 当前环境不支持 webgl2 . ');
        }
        return context;
    }
    static createTexture(that, target, texture, image) {
        const webglTexture = that.cache.acquireTexture(texture);
        that.state.bindTexture(target, webglTexture);
        const levels = 1;
        const format = that.gl.RGBA8;
        const width = image.width;
        const height = image.height;
        that.gl.texStorage2D(target, levels, format, width, height);
        texture.needsUpdate = true;
        return webglTexture;
    }
    static setTextureParameters(that, target, texture) {
        that.gl.texParameteri(target, that.gl.TEXTURE_WRAP_S, texture.wrapS);
        that.gl.texParameteri(target, that.gl.TEXTURE_WRAP_T, texture.wrapT);
        that.gl.texParameteri(target, that.gl.TEXTURE_MAG_FILTER, texture.magFilter);
        that.gl.texParameteri(target, that.gl.TEXTURE_MIN_FILTER, texture.minFilter);
    }
    static updateTexture(that, target, image) {
        const level = 0;
        const xoffset = 0;
        const yoffset = 0;
        const format = that.gl.RGBA;
        const type = that.gl.UNSIGNED_BYTE;
        that.gl.texSubImage2D(target, level, xoffset, yoffset, format, type, image);
    }
};
class WebGLRenderer {
    gl;
    state;
    cache;
    renderList;
    constructor(canvas) {
        this.gl = Helper$3.getWebGL2(canvas);
        this.state = new WebGLState(this.gl);
        this.cache = new WebGLCache(this.gl);
        this.renderList = { opaque: [], transparent: [] };
    }
    setSize(width, height) {
        this.state.setViewport(0, 0, width, height);
    }
    render(scene, camera) {
        scene.updateMatrix();
        camera.updateMatrix();
        scene.updateLights(camera);
        this.projectObject(scene, camera);
        this.renderShadow(scene);
        this.renderBackground(scene);
        this.renderObjects(scene, camera);
        this.cache.releaseRenderItem(this.renderList.opaque);
        this.cache.releaseRenderItem(this.renderList.transparent);
    }
    projectObject(object, camera) {
        if (!object.visible) {
            return;
        }
        if (object instanceof Mesh && camera.frustumCulling(object)) {
            const geometry = object.geometry;
            if (Array.isArray(object.material)) {
                const materials = object.material;
                const renderGroups = geometry.groups;
                for (const group of renderGroups) {
                    const material = materials[group.materialIndex];
                    const item = this.cache.mallocRenderItem(object, geometry, material, group);
                    if (material.transparent) {
                        this.renderList.transparent.push(item);
                    }
                    else {
                        this.renderList.opaque.push(item);
                    }
                }
            }
            else {
                const item = this.cache.mallocRenderItem(object, geometry, object.material);
                if (object.material.transparent) {
                    this.renderList.transparent.push(item);
                }
                else {
                    this.renderList.opaque.push(item);
                }
            }
        }
        for (const child of object.children) {
            this.projectObject(child, camera);
        }
    }
    renderShadow(scene) {
        const gl = this.gl;
        const light = scene.directionalLight;
        const shadow = light.shadow;
        shadow.updateShadowMatrix(light);
        let frameBuffer = this.cache.getFrameBuffer(shadow);
        if (!frameBuffer) {
            frameBuffer = this.cache.acquireFrameBuffer(shadow);
            this.state.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
            let texture = this.cache.getTexture(shadow.texture);
            if (!texture) {
                texture = this.cache.acquireTexture(shadow.texture);
            }
            this.state.bindTexture(gl.TEXTURE_2D, texture);
            Helper$3.setTextureParameters(this, gl.TEXTURE_2D, shadow.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, shadow.size, shadow.size, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, texture, 0);
            this.state.bindTexture(gl.TEXTURE_2D, null);
        }
        else {
            this.state.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        }
        const viewport = this.state.viewport.clone();
        this.state.setViewport(0, 0, shadow.size, shadow.size);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        this.renderObjectShadow(scene, shadow, scene);
        this.state.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.state.setViewport(viewport.x, viewport.y, viewport.z, viewport.w);
    }
    renderObjectShadow(scene, shadow, object) {
        if (!object.visible) {
            return;
        }
        if (object instanceof Mesh && shadow.camera.frustumCulling(object)) {
            const geometry = object.geometry;
            const material = object.material;
            if (Array.isArray(material)) {
                const groups = geometry.groups;
                for (let k = 0, kl = groups.length; k < kl; k++) {
                    const group = groups[k];
                    if (!material[group.materialIndex]) {
                        continue;
                    }
                    this.renderObject(scene, shadow.camera, object, geometry, shadow.material, group);
                }
            }
            else {
                this.renderObject(scene, shadow.camera, object, geometry, shadow.material);
            }
        }
        for (const child of object.children) {
            this.renderObjectShadow(scene, shadow, child);
        }
    }
    renderBackground(scene) {
        const background = scene.getBackground();
        if (background instanceof Color) {
            this.state.setClearColor(background.r, background.g, background.b);
        }
        this.gl.clear(Constants.CLEAR_MASK);
        if (background instanceof Mesh) {
            const item = this.cache.mallocRenderItem(background, background.geometry, background.material);
            this.renderList.opaque.unshift(item);
        }
    }
    renderObjects(scene, camera) {
        const opaque = this.renderList.opaque;
        const transparent = this.renderList.transparent;
        for (const renderItem of opaque) {
            this.renderObject(scene, camera, renderItem.mesh, renderItem.geometry, renderItem.material, renderItem.group);
        }
        for (const renderItem of transparent) {
            this.renderObject(scene, camera, renderItem.mesh, renderItem.geometry, renderItem.material, renderItem.group);
        }
    }
    renderObject(scene, camera, mesh, geometry, material, group) {
        material.onBeforRender(scene, mesh, camera);
        const program = this.cache.acquireProgram(material);
        const attributes = this.cache.acquireAttributes(program);
        const uniforms = this.cache.acquireUniforms(program);
        this.state.useProgram(program);
        const frontFaceCW = mesh.worldMatrix.determinant() < 0;
        this.state.setFrontFace(frontFaceCW);
        this.bindGeometry(geometry, attributes);
        this.applyMaterial(material, uniforms);
        this.renderBuffer(geometry, group);
    }
    bindGeometry(geometry, webglAttributes) {
        const vao = this.cache.acquireVertexArray(geometry);
        this.state.bindVertexArray(vao);
        for (const webglAttribute of webglAttributes) {
            const attribute = geometry.getAttribute(webglAttribute.name);
            if (!attribute) {
                webglAttribute.disable(vao);
                continue;
            }
            const buffer = this.uploadAttributeToGPU(this.gl.ARRAY_BUFFER, attribute);
            webglAttribute.bind(attribute, vao, buffer);
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
            this.gl.bufferData(target, attribute.array, this.gl.STATIC_DRAW);
            attribute.needsUpdate = false;
        }
        this.state.bindBuffer(target, buffer);
        if (attribute.needsUpdate) {
            this.gl.bufferSubData(target, 0, attribute.array);
            attribute.needsUpdate = false;
        }
        return buffer;
    }
    applyMaterial(material, webglUniforms) {
        this.state.backfaceCulling(material.backfaceCulling);
        this.state.resetTextureUnits();
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
                webglTexture = Helper$3.createTexture(this, target, texture, texture.images[0]);
            }
            this.state.bindTexture(target, webglTexture);
            if (texture.needsUpdate) {
                Helper$3.setTextureParameters(this, target, texture);
                const pxTarget = this.gl.TEXTURE_CUBE_MAP_POSITIVE_X;
                for (let ii = 0; ii < 6; ii++) {
                    Helper$3.updateTexture(this, pxTarget + ii, texture.images[ii]);
                }
                this.gl.generateMipmap(target);
                texture.needsUpdate = false;
            }
            return;
        }
        if (texture instanceof ImageTexture && texture.image) {
            const target = this.gl.TEXTURE_2D;
            if (!webglTexture) {
                webglTexture = Helper$3.createTexture(this, target, texture, texture.image);
            }
            this.state.bindTexture(target, webglTexture);
            if (texture.needsUpdate) {
                Helper$3.setTextureParameters(this, target, texture);
                Helper$3.updateTexture(this, target, texture.image);
                this.gl.generateMipmap(target);
                texture.needsUpdate = false;
            }
            return;
        }
        if (texture instanceof DataTexture && webglTexture) {
            this.state.bindTexture(this.gl.TEXTURE_2D, webglTexture);
            return;
        }
    }
    renderBuffer(geometry, group) {
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

class PerspectiveCamera extends Camera {
    fov;
    aspect;
    near;
    far;
    constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
        super();
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
        const fovRadian = this.fov / 180 * Math.PI;
        const top = this.near * Math.tan(fovRadian * 0.5);
        const bottom = -top;
        const right = top * this.aspect;
        const left = -right;
        this.projectionMatrix.makePerspective(left, right, top, bottom, this.near, this.far);
    }
}

let Helper$2 = class Helper {
    static EPS = 0.000001;
};
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
        this.phi = Math.max(Helper$2.EPS, Math.min(this.phi, Math.PI - Helper$2.EPS));
        return this;
    }
}

let Helper$1 = class Helper {
    static offset = new Vector3();
    static spherical = new Spherical();
    static matrix4 = new Matrix4();
    static pixelDelta = new Vector2();
    static panDelta = new Vector3();
    static matrix3 = new Matrix3();
    static NONE = -1;
    static PAN = 0;
    static ZOOM = 1;
    static ROTATE = 2;
};
class OrbitControls {
    canvas;
    camera;
    dispose;
    viewPoint = new Vector3();
    state = Helper$1.NONE;
    rotateStart = new Vector2();
    rotateEnd = new Vector2();
    rotateDelta = new Vector2();
    panStart = new Vector2();
    panEnd = new Vector2();
    panOffset = new Vector3();
    zoom = 1;
    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;
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
    update(delta) {
        const position = this.camera.position;
        const rotation = this.camera.rotation;
        const offset = Helper$1.offset;
        const spherical = Helper$1.spherical;
        const matrix = Helper$1.matrix4;
        offset.subVectors(position, this.viewPoint);
        spherical.setFromVector3(offset);
        spherical.theta -= this.rotateDelta.x;
        spherical.phi -= this.rotateDelta.y;
        spherical.makeSafe();
        spherical.radius *= this.zoom;
        spherical.toVector3(offset);
        this.viewPoint.sub(this.panOffset);
        position.copy(this.viewPoint);
        position.add(offset);
        this.panOffset.setScalar(0);
        this.rotateDelta.setScalar(0);
        this.zoom = 1;
        matrix.makeLookAt(position, this.viewPoint);
        matrix.extractRotation(rotation);
    }
    rotate(pixelDelta) {
        pixelDelta.multiplyScalar(2 * Math.PI / this.canvas.height);
        this.rotateDelta.add(pixelDelta);
    }
    pan(pixelDelta) {
        const panDelta = Helper$1.panDelta;
        const matrix3 = Helper$1.matrix3;
        let edge = 1;
        if (this.camera instanceof PerspectiveCamera) {
            const fov = this.camera.fov;
            const position = this.camera.position;
            const halfFov = fov / 360 * Math.PI;
            edge = position.distanceTo(this.viewPoint);
            edge *= Math.tan(halfFov);
            pixelDelta.multiplyScalar(2 * edge / this.canvas.height);
        }
        else if (this.camera instanceof OrthographicCamera) {
            const left = this.camera.left;
            const right = this.camera.right;
            const top = this.camera.top;
            const bottom = this.camera.bottom;
            pixelDelta.x *= (right - left) / this.canvas.width;
            pixelDelta.y *= (top - bottom) / this.canvas.height;
        }
        panDelta.set(pixelDelta.x, -pixelDelta.y, 0);
        matrix3.setFromMatrix4(this.camera.worldMatrix);
        panDelta.applyMatrix3(matrix3);
        this.panOffset.add(panDelta);
    }
    onContextMenu(event) {
        event.preventDefault();
    }
    onPointerDown(event) {
        this.canvas.setPointerCapture(event.pointerId);
        if (event.button === 0) {
            this.state = Helper$1.ROTATE;
            this.rotateStart.set(event.clientX, event.clientY);
        }
        else if (event.button === 2) {
            this.state = Helper$1.PAN;
            this.panStart.set(event.clientX, event.clientY);
        }
    }
    onPointerMove(event) {
        const pixelDelta = Helper$1.pixelDelta;
        if (this.state === Helper$1.ROTATE) {
            this.rotateEnd.set(event.clientX, event.clientY);
            pixelDelta.subVectors(this.rotateEnd, this.rotateStart);
            this.rotateStart.copy(this.rotateEnd);
            this.rotate(pixelDelta);
        }
        if (this.state === Helper$1.PAN) {
            this.panEnd.set(event.clientX, event.clientY);
            pixelDelta.subVectors(this.panEnd, this.panStart);
            this.panStart.copy(this.panEnd);
            this.pan(pixelDelta);
        }
    }
    onPointerUp(event) {
        this.canvas.releasePointerCapture(event.pointerId);
        this.state = Helper$1.NONE;
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

class ImageLoader {
    static load(url) {
        return new Promise(function (resolve, reject) {
            const image = document.createElement('img');
            image.onload = () => {
                resolve(image);
            };
            image.onerror = () => {
                reject();
            };
            image.src = url;
        });
    }
}

class Helper {
    static cubeSuffixes = ['/px.jpg', '/nx.jpg', '/py.jpg', '/ny.jpg', '/pz.jpg', '/nz.jpg'];
}
class TextureLoader {
    static async loadImageTexture(url) {
        const image = await ImageLoader.load(url);
        if (image) {
            return new ImageTexture(image);
        }
    }
    static async loadCubeTexture(url) {
        const images = [];
        for (const suffix of Helper.cubeSuffixes) {
            const image = await ImageLoader.load(url + suffix);
            if (!image) {
                return;
            }
            images.push(image);
        }
        return new CubeTexture(images);
    }
}

class Dxy {
    canvas;
    renderer;
    scene;
    camera;
    orbitControls;
    constructor(canvas = document.createElement('canvas')) {
        this.canvas = canvas;
        this.renderer = new WebGLRenderer(canvas);
        this.scene = new Scene();
        this.camera = new PerspectiveCamera();
        this.orbitControls = new OrbitControls(canvas, this.camera);
        this.resizing(true);
        this.startAnimationFrame();
    }
    startAnimationFrame() {
        let _elapsed = 0, _delta = 0;
        const frameCallback = (_time) => {
            requestAnimationFrame(frameCallback);
            _time /= 1000;
            _delta = _time - _elapsed;
            _elapsed = _time;
            this.resizing();
            this.animate(_delta);
        };
        requestAnimationFrame(frameCallback);
    }
    resizing(force) {
        if (!force &&
            this.canvas.width === this.canvas.clientWidth &&
            this.canvas.height === this.canvas.clientHeight) {
            return;
        }
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.canvas.width = width;
        this.canvas.height = height;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    animate(delta) {
        if (this.scene.children[0]) {
            const y = this.scene.children[0].rotation.eulerY + Math.PI * delta * 0.25;
            this.scene.children[0].rotation.eulerY = y % (Math.PI * 2);
        }
        this.orbitControls.update(delta);
        this.renderer.render(this.scene, this.camera);
    }
    async loadModel(parameters = {}) {
        let result = false;
        const type = parameters.type || 'glb';
        const url = parameters.url;
        switch (type) {
            case 'glb':
                const object = await GLBLoader.load(url);
                if (object) {
                    this.scene.add(object);
                    result = true;
                }
                break;
        }
        return result;
    }
    async setBackground(parameters = {}) {
        const type = parameters.type;
        const color = parameters.color;
        parameters.image;
        const skybox = parameters.skybox;
        switch (type) {
            case 'color':
                this.scene.setBackgroundColor(color);
                break;
            case 'image':
                break;
            case 'skybox':
                const cubeTexture = await TextureLoader.loadCubeTexture(skybox);
                if (cubeTexture) {
                    this.scene.setBackgroundCube(cubeTexture);
                }
                break;
        }
    }
}

export { Dxy as default };
//# sourceMappingURL=dxy.js.map

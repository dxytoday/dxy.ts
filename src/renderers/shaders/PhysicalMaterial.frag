#version 300 es

precision highp float;
precision highp int;

out vec4 oColor;

in vec2 vUV;
in vec3 vNormal;
in vec3 vPosition;
in vec4 vShadowCoord;

uniform bool useUV;

uniform vec3 color;
uniform float opacity;

uniform sampler2D map;
uniform bool useMap;

uniform sampler2D shadowMap;

uniform float roughness;
uniform float metalness;

uniform vec3 ambientLightColor;

struct DirectionalLight {

    vec3 color;
    vec3 direction;

};

uniform DirectionalLight directionalLight;

#define RECIPROCAL_PI 0.3183098861837907
#define EPSILON 1e-6

#define saturate( a ) clamp( a, 0.0, 1.0 )

float pow2(const in float x) {

    return x * x;

}

float getShadow() {

    vec3 shadowCoord = vShadowCoord.xyz / vShadowCoord.w;
    shadowCoord.z -= 0.006f; // 添加一个固定的 bias ，暂时不做参数传递

    bool inFrustum = shadowCoord.x >= 0.0f && shadowCoord.x <= 1.0f && shadowCoord.y >= 0.0f && shadowCoord.y <= 1.0f;
    float projectedDepth = texture(shadowMap, shadowCoord.xy).r;

    return (inFrustum && projectedDepth <= shadowCoord.z) ? 0.0f : 1.0f;

}

vec3 BRDF_Lambert(const in vec3 diffuseColor) {

    return RECIPROCAL_PI * diffuseColor;

}

vec3 F_Schlick(const in vec3 f0, const in float dotVH) {

    float fresnel = exp2((-5.55473f * dotVH - 6.98316f) * dotVH);
    return f0 * (1.0f - fresnel) + fresnel;

}

float D_GGX(const in float alpha, const in float dotNH) {

    float a2 = pow2(alpha);

    float denom = pow2(dotNH) * (a2 - 1.0f) + 1.0f;

    return RECIPROCAL_PI * a2 / pow2(denom);

}

float V_GGX_SmithCorrelated(const in float alpha, const in float dotNL, const in float dotNV) {

    float a2 = pow2(alpha);

    float gv = dotNL * sqrt(a2 + (1.0f - a2) * pow2(dotNV));
    float gl = dotNV * sqrt(a2 + (1.0f - a2) * pow2(dotNL));

    return 0.5f / max(gv + gl, EPSILON);

}

// 使用 GGX 函数，金属高光有更真实的拖尾效果
vec3 BRDF_GGX(const in vec3 L, const in vec3 V, const in vec3 N, const in vec3 f0, const in float roughness) {

    float alpha = pow2(roughness);

    vec3 H = normalize(L + V);

    float dotNL = saturate(dot(N, L));
    float dotNV = saturate(dot(N, V));
    float dotNH = saturate(dot(N, H));
    float dotVH = saturate(dot(V, H));

    vec3 F = F_Schlick(f0, dotVH);

    float D = D_GGX(alpha, dotNH);
    float G = V_GGX_SmithCorrelated(alpha, dotNL, dotNV);

    return F * (G * D);

}

vec3 PBR(const in vec3 materialColor) {

    vec3 N = normalize(vNormal);
    vec3 V = normalize(-vPosition);
    vec3 L = normalize(directionalLight.direction);

    float geometryRoughness = max(roughness, 0.0525f);

    // 叠加表面梯度
    vec3 dxy = max(abs(dFdx(N)), abs(dFdy(N)));
    float gradient = max(max(dxy.x, dxy.y), dxy.z);
    geometryRoughness = min(geometryRoughness + gradient, 1.0f);

    // 材质的漫反射基础色
    vec3 diffuseColor = materialColor * (1.0f - metalness);

    // 材质的镜面反射基础色
    vec3 specularColor = mix(vec3(0.04f), materialColor, metalness);

    // 直接辐照度，来自灯光的辐照度
    vec3 directIrradiance = directionalLight.color * saturate(dot(N, L));

    // 阴影中的直接辐照度为 0
    directIrradiance *= getShadow();

    // 直接漫反射，来自灯光的漫反射，注意：BRDF 函数使用 GGX 版本，漫反射项忽略 Kd 系数
    vec3 directDiffuse = directIrradiance * BRDF_Lambert(diffuseColor);

    // 直接镜面反射，来自灯光的镜面反射
    vec3 directSpecular = directIrradiance * BRDF_GGX(L, V, N, specularColor, geometryRoughness);

    // 间接辐照度，来自环境的辐照度 = 环境光 + IBL
    vec3 indirectIrradiance = ambientLightColor;

    // 间接漫反射，来自环境的漫反射
    vec3 indirectDiffuse = indirectIrradiance * BRDF_Lambert(diffuseColor);

    // 最终颜色 = 直接漫反射 + 直接镜面反射 + 间接漫反射 + 间接镜面反射
    return directDiffuse + directSpecular + indirectDiffuse;

}

void main() {

    vec4 finalColor = vec4(color, opacity);

    vec4 noneColor = vec4(1, 1, 1, 1);
    vec4 mapColor = texture(map, vUV);
    float mapColorAmount = useMap && useUV ? 1.0f : 0.0f;
    finalColor *= mix(noneColor, mapColor, mapColorAmount);

    finalColor.rgb = PBR(finalColor.rgb);

    // linear sRGB 转换到 sRGB

    vec3 greater = pow(finalColor.rgb, vec3(0.41666f)) * 1.055f - vec3(0.055f);
    vec3 lessAndEqual = finalColor.rgb * 12.92f;
    vec3 flag = vec3(lessThanEqual(finalColor.rgb, vec3(0.0031308f)));

    oColor.rgb = mix(greater, lessAndEqual, flag);
    oColor.a = finalColor.a;

}

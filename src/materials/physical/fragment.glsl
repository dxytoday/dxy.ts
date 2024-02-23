#version 300 es

precision highp float;
precision highp int;

out vec4 oColor;

in vec2 vUV;
in vec3 vNormal;
in vec3 vPosition;
in vec4 vColor;

uniform bool useUV;
uniform bool useColor;
uniform bool useNormal;

uniform vec3 color;
uniform float opacity;

uniform sampler2D map;
uniform bool useMap;

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

    // 来自灯光的辐照度 - 直接辐照度
    vec3 lightIrradiance = directionalLight.color * saturate(dot(N, L));

    // 来自灯光的漫反射 - 直接漫反射
    vec3 lightDiffuse = lightIrradiance * BRDF_Lambert(diffuseColor);

    // 来自灯光的镜面反射 - 直接镜面反射
    vec3 lightSpecular = lightIrradiance * BRDF_GGX(L, V, N, specularColor, geometryRoughness);

    // 来自环境的辐照度 = 环境光 + IBL - 间接辐照度
    vec3 ambientIrradiance = ambientLightColor;

    // 来自环境的漫反射 - 间接漫反射
    vec3 ambientDiffuse = ambientIrradiance * BRDF_Lambert(diffuseColor);

    // 最终颜色 = 直接漫反射 + 直接镜面反射 + 间接漫反射 + 间接镜面反射
    return lightDiffuse + lightSpecular + ambientDiffuse;

}

void main() {

    vec4 finalColor = vec4(color, opacity);

    if(useMap && useUV) {

        finalColor *= texture(map, vUV);

    }

    if(useColor) {

        finalColor *= vColor;

    }

    if(useNormal) {

        finalColor.rgb = PBR(finalColor.rgb);

    } else {

        finalColor.rgb *= ambientLightColor;

    }

    // linear sRGB 转换到 sRGB

    vec3 greater = pow(finalColor.rgb, vec3(0.41666f)) * 1.055f - vec3(0.055f);
    vec3 lessAndEqual = finalColor.rgb * 12.92f;
    vec3 flag = vec3(lessThanEqual(finalColor.rgb, vec3(0.0031308f)));

    oColor.rgb = mix(greater, lessAndEqual, flag);
    oColor.a = finalColor.a;

}

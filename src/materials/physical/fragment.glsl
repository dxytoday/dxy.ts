#version 300 es

#define RECIPROCAL_PI 0.3183098861837907
#define EPSILON 1e-6

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

float saturate(float a) {

    return clamp(a, 0.0f, 1.0f);

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

        // 几何属性
        vec3 normal = normalize(vNormal);
        vec3 viewDirection = normalize(-vPosition);

        float metalnessFactor = metalness;
        float roughnessFactor = max(roughness, 0.0525f);

        // 叠加梯度到粗糙度
        vec3 dxy = max(abs(dFdx(normal)), abs(dFdy(normal)));
        float dRoughness = max(max(dxy.x, dxy.y), dxy.z);
        roughnessFactor += dRoughness;
        roughnessFactor = min(roughnessFactor, 1.0f);

        // 只计算非金属部分的漫反射
        vec3 diffuseColor = finalColor.rgb * (1.0f - metalnessFactor);

        // 金属的镜面反射是自身颜色
        vec3 specularColor = mix(vec3(0.04f), finalColor.rgb, metalnessFactor);

        // 辐照度
        float dotNL = saturate(dot(normal, directionalLight.direction));
        vec3 irradiance = directionalLight.color * dotNL;

        // 镜面反射 - BRDF_GGX

        vec3 specular;

        {

            float alpha = roughnessFactor * roughnessFactor;
            float a2 = alpha * alpha;

            vec3 halfDir = normalize(directionalLight.direction + viewDirection);

            float dotNV = saturate(dot(normal, viewDirection));
            float dotNH = saturate(dot(normal, halfDir));
            float dotVH = saturate(dot(viewDirection, halfDir));

            // F - F_Schlick 菲涅尔项
            float fresnel = exp2((-5.55473f * dotVH - 6.98316f) * dotVH);
            vec3 F = specularColor * (1.0f - fresnel) + fresnel;

            // G - V_GGX_SmithCorrelated 几何遮蔽函数
            float gv = dotNL * sqrt(a2 + (1.0f - a2) * (dotNV * dotNV));
            float gl = dotNV * sqrt(a2 + (1.0f - a2) * (dotNL * dotNL));
            float V = 0.5f / max(gv + gl, EPSILON);

            // D - D_GGX 法线分布函数
            float denom = (dotNH * dotNH) * (a2 - 1.0f) + 1.0f;
            float D = RECIPROCAL_PI * a2 / (denom * denom);

            specular = irradiance * (F * (V * D));

        }

        // 漫反射 - BRDF_Lambert 
        vec3 diffuse = irradiance * (RECIPROCAL_PI * diffuseColor);

        // 间接漫反射
        diffuse += ambientLightColor * (RECIPROCAL_PI * diffuseColor);

        finalColor.rgb = diffuse + specular;

    }

    // finalColor.rgb *= ambientLight;

    oColor = finalColor;

}
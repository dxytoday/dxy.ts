#version 300 es

in vec3 position;
in vec3 normal;
in vec2 uv;

uniform mat3 normalMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 shadowMatrix;

out vec2 vUV;
out vec3 vNormal;
out vec3 vPosition;
out vec4 vShadowCoord;

void main() {

    vUV = uv;
    vNormal = normalMatrix * normal;

    vec4 mPosition = modelMatrix * vec4(position, 1);
    vec4 mvPosition = viewMatrix * mPosition;

    vShadowCoord = shadowMatrix * mPosition;
    vPosition = mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;

}

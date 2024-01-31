#version 300 es

in vec3 position;
in vec3 normal;
in vec2 uv;

uniform bool useNormal;

uniform mat3 normalMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec2 vUV;
out vec3 vNormal;
out vec3 vPosition;

void main() {

    vUV = uv;
    vNormal = normalMatrix * normal;
    vPosition = (modelViewMatrix * vec4(position, 1)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);

}
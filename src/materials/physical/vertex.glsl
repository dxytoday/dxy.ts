#version 300 es

in vec3 position;
in vec3 normal;
in vec2 uv;
in vec4 color;

uniform mat3 normalMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec2 vUV;
out vec3 vNormal;
out vec3 vPosition;
out vec4 vColor;

void main() {

    vUV = uv;
    vColor = color;
    vNormal = normalMatrix * normal;
    vPosition = (modelViewMatrix * vec4(position, 1)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);

}
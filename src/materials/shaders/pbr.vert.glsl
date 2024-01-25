#version 300 es

in vec3 position;
in vec3 normal;
in vec2 uv;

uniform bool useNormal;
uniform bool useUV;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec2 vUV;

void main() {

    if(useUV) {

        vUV = uv;

    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);

}
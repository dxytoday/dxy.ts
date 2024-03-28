#version 300 es

in vec3 position;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec2 vHighPrecisionZW;

void main() {

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);

    vHighPrecisionZW = gl_Position.zw;

}
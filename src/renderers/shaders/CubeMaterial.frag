#version 300 es

precision highp float;
precision highp int;

in vec3 v_position;

uniform samplerCube cube;

out vec4 oColor;

void main() {

    oColor = texture(cube, v_position);

}
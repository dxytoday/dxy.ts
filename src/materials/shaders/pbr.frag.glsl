#version 300 es

precision highp float;
precision highp int;

out vec4 oColor;

uniform vec3 color;
uniform float opacity;

void main() {

    oColor = vec4(color, opacity);

}
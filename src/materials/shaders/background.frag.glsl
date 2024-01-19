#version 300 es

precision highp float;
precision highp int;

out vec4 oColor;

uniform sampler2D map;

in vec2 vUv;

void main() {

    oColor = texture(map, vUv);

}
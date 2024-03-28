#version 300 es

precision highp float;
precision highp int;

in vec2 vUv;

uniform sampler2D map;

out vec4 oColor;

void main() {

    oColor = texture(map, vUv);

}
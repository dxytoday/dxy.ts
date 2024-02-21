#version 300 es

precision highp float;
precision highp int;

out vec4 oColor;

uniform bool isCube;
uniform samplerCube cube;
uniform sampler2D map;

in vec2 vUv;
in vec3 v_position;

void main() {

    if(isCube) {

        oColor = texture(cube, v_position);

    } else {

        oColor = texture(map, vUv);

    }

}
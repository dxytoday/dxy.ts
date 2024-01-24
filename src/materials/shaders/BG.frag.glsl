#version 300 es

precision highp float;
precision highp int;

out vec4 oColor;

uniform bool isCube;
uniform sampler2D map;
// uniform samplerCube cube;

in vec2 vUv;
in vec3 v_position;

void main() {

    if(isCube) {

        // oColor = texture(cube, normalize(v_position.xyz / v_position.w));
        oColor = vec4(1, 1, 1, 1);

    } else {

        oColor = texture(map, vUv);

    }

}
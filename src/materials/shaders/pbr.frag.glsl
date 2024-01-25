#version 300 es

precision highp float;
precision highp int;

out vec4 oColor;

in vec2 vUV;
uniform bool useUV;

uniform vec3 color;
uniform float opacity;

uniform sampler2D map;
uniform bool useMap;

void main() {

    if(useMap && useUV) {

        oColor = texture(map, vUV);

    } else {

        oColor = vec4(color, opacity);

    }

}
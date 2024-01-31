#version 300 es

precision highp float;
precision highp int;

out vec4 oColor;

in vec2 vUV;
in vec3 vNormal;
in vec3 vPosition;

uniform bool useUV;
uniform bool useNormal;

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
#version 300 es

precision highp float;
precision highp int;

in vec2 vHighPrecisionZW;

uniform float opacity;

out vec4 oColor;

void main() {

    float fragCoordZ = 0.5f * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5f;

    oColor = vec4(vec3(1.0f - fragCoordZ), opacity);

}

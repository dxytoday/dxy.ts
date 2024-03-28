#version 300 es

in vec3 position;
in vec2 uv;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

out vec2 vUv;
out vec3 v_position;

void main() {

    vUv = uv;

    v_position = normalize(position);

    vec4 mvPosition = viewMatrix * vec4(position, 0);
    mvPosition.w = 1.0f;

    gl_Position = projectionMatrix * mvPosition;

    // ndc 值域为 -1 到 +1，对应 webgl 深度值的 0 到 1
    // z 值为 w 确保转换到 webgl 有效深度值的最远处
    gl_Position.z = gl_Position.w;

}
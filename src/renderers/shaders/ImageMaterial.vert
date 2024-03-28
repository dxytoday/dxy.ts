#version 300 es

in vec3 position;
in vec2 uv;

out vec2 vUv;

void main() {

    vUv = uv;

    // ndc 值域为 -1 到 +1
    // 对应 webgl 深度值的 0 到 1
    // z 值为 1 确保转换到 webgl 有效深度值的最远处
    gl_Position = vec4(position.xy, 1, 1);

}
#version 300 es

in vec3 position;
in vec2 uv;

uniform bool isCube;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

out vec2 vUv;
out vec3 v_position;

void main() {

    vUv = uv;

    float depth = 0.99999f;

    if(isCube) {

        v_position = normalize(position);

        vec4 mvPosition = viewMatrix * vec4(position, 0);
        mvPosition.w = 1.0f;

        gl_Position = projectionMatrix * mvPosition;
        gl_Position.z = gl_Position.w * depth;

    } else {

        gl_Position = vec4(position.xy, depth, 1);

    }

}
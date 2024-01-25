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

    if(isCube) {

        v_position = normalize(position);

        vec4 mvPosition = viewMatrix * vec4(position, 0);
        mvPosition.w = 1.0f;

        gl_Position = projectionMatrix * mvPosition;
        gl_Position.z = gl_Position.w;

    } else {

        gl_Position = vec4(position.xy, 1, 1);

    }

}
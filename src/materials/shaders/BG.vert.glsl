#version 300 es

in vec3 position;
in vec2 uv;

uniform bool isCube;

out vec2 vUv;
out vec3 v_position;

void main() {

    vUv = uv;

    if(isCube) {

        v_position = position;
        gl_Position = vec4(position, 1);

    } else {

        gl_Position = vec4(position.xy, 1, 1);

    }

}
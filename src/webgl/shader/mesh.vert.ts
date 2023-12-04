export default /* glsl */ `#version 300 es

#define PREDEFINE

in vec3 position;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;


#ifdef US_UV

	in vec2 uv;
	out vec2 vUv;

#endif


#ifdef US_COLOR

	in vec4 color;
	out vec4 vColor;

#endif


#ifdef US_NORMAL

	in vec3 normal;
	uniform mat3 normalMatrix;
	out vec3 vNormal;
	out vec3 vPosition;

#endif


#ifdef US_TANGENT

	in vec3 tangent;
	out vec3 vTangent;
	out vec3 vBitangent;

#endif


void main() {

	#ifdef US_UV

		vUv = uv;

	#endif


	#ifdef US_COLOR

		vColor = color;

	#endif


	#ifdef US_TANGENT

		vTangent = normalize((modelViewMatrix * vec4(tangent, 0.0)).xyz);
		vBitangent = normalize(cross( vNormal, vTangent ));

	#endif

	vec4 finalPosition = modelViewMatrix * vec4(position, 1);

	#ifdef US_NORMAL

		vNormal = normalMatrix * normal;
		vPosition = finalPosition.xyz;

	#endif

	gl_Position = projectionMatrix * finalPosition;


}
`;
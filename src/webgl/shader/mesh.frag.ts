export default /* glsl */ `#version 300 es

precision highp float;
precision highp int;


#define PREDEFINE


out vec4 oColor;

uniform vec3 color;
uniform float opacity;
uniform vec3 ambient;
uniform float roughness;
uniform float metalness;


#ifdef US_UV

	in vec2 vUv;

#endif


#ifdef US_COLOR

	in vec4 vColor;

#endif


#ifdef US_TANGENT

	 in vec3 vTangent;
	 in vec3 vBitangent;

#endif


#ifdef US_NORMAL

	in vec3 vNormal;
	in vec3 vPosition;

	struct Light {

		vec3 color;
		vec3 position;
		vec2 cutOff;

	};

	uniform Light light;

#endif


#ifdef US_MAP

	uniform sampler2D map;

#endif


#ifdef USE_ROUGHNESSMAP

	uniform sampler2D roughnessMap;

#endif


#ifdef USE_METALNESSMAP

	uniform sampler2D metalnessMap;

#endif


#ifdef US_NORMALMAP

	uniform sampler2D normalMap;
	uniform vec2 normalScale;

	#ifndef US_TANGENT

		mat3 getTangentFrame(vec3 normal) {

			vec3 q0 = dFdx(vPosition);
			vec3 q1 = dFdy(vPosition);
			vec2 st0 = dFdx(vUv);
			vec2 st1 = dFdy(vUv);
					
			vec3 N = normal;
					
			vec3 q1perp = cross(q1, N);
			vec3 q0perp = cross(N, q0);
					
			vec3 T = q1perp * st0.x + q0perp * st1.x;
			vec3 B = q1perp * st0.y + q0perp * st1.y;
					
			float det = max(dot(T, T), dot(B, B));
			float scale = (det == 0.0f) ? 0.0f : inversesqrt(det);
					
			return mat3(T * scale, B * scale, N);

		}

	#endif

#endif


void main() {

	vec4 finalColor = vec4(color, opacity);


	#ifdef US_COLOR

	finalColor * vColor;

	#endif


	#ifdef US_MAP

		vec4 texelMap = texture(map, vUv);
		finalColor *= texelMap;

	#endif


	#ifdef US_NORMAL

		vec3 normal = normalize(vNormal);

		#ifdef US_NORMALMAP

			vec3 mapN = texture(normalMap, vUv).xyz * 2.0f - 1.0f;
			mapN.xy *= normalScale;

			mat3 tbn;

			#ifdef USE_TANGENT

				tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );

			#else

				tbn = getTangentFrame(normal);

			#endif

			normal = normalize(tbn * mapN);

		#endif

		// blinn phong

		vec3 surfaceToLight = normalize( light.position - vPosition );
		vec3 surfaceToView = normalize( - vPosition );

		vec3 lightColor = light.color;
		vec3 lightDir = normalize( - light.position );

		float lambert = max( 0.0, dot( normal, surfaceToLight ) );
		vec3 diffuseColor =  ( lightColor * lambert ) * finalColor.rgb;

		float theta = dot( lightDir , surfaceToLight);
		float intensity = smoothstep( light.cutOff.y, light.cutOff.x, theta );

		vec3 halfVector = normalize( surfaceToLight + surfaceToView );
		float specular = max( 0.0, dot( normal, halfVector ) ) * intensity;
		vec3 specularColor = lightColor * specular * finalColor.rgb;

		vec3 ambientColor = ambient * finalColor.rgb;

		finalColor.rgb = ambientColor + diffuseColor + specularColor;

	#else

		finalColor.rgb *= ambient;

	#endif


	oColor = finalColor;

}
`;
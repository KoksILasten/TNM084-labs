#version 410 core

out vec4 out_Color;
in vec2 gsTexCoord;
in vec3 gsNormal;

in vec3 height;

void main(void) {
	float shade = normalize(gsNormal).z; // Fake light
//	out_Color = vec4(gsTexCoord.s, gsTexCoord.t, 0.0, 1.0);
	out_Color = vec4(gsNormal.x * shade, gsNormal.y * shade, gsNormal.z * shade, 1.0);
	if(abs(height.x) < .1 || abs(height.y) < .1 || abs(height.z) < .1) {
		out_Color = vec4(1.0 * shade, 0.13 * shade, 0.01, 1.0);
	}
	//out_Color = vec4(shade, shade, shade, 1.0);
}

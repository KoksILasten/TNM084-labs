#version 410 core

layout(triangles) in;
// Use line_strip for visualization and triangle_strip for solids
layout(triangle_strip, max_vertices = 3) out;
//layout(line_strip, max_vertices = 3) out;
in vec2 teTexCoord[3];
in vec3 teNormal[3];
out vec2 gsTexCoord;
out vec3 gsNormal;
uniform sampler2D tex;

uniform mat4 projMatrix;
uniform mat4 mdlMatrix;
uniform mat4 camMatrix;

uniform float disp;
uniform int texon;

out vec3 height;

vec2 random2(vec2 st) {
    st = vec2(dot(st, vec2(127.1, 311.7)), dot(st, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}

// Gradient Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/XdXGW8
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(dot(random2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)), dot(random2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x), mix(dot(random2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(random2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}

vec3 random3(vec3 st) {
    st = vec3(dot(st, vec3(127.1, 311.7, 543.21)), dot(st, vec3(269.5, 183.3, 355.23)), dot(st, vec3(846.34, 364.45, 123.65))); // Haphazard additional numbers by IR
    return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}

// Gradient Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/XdXGW8
// Trivially extended to 3D by Ingemar
float noise(vec3 st) {
    vec3 i = floor(st);
    vec3 f = fract(st);

    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(mix(dot(random3(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)), dot(random3(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x), mix(dot(random3(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)), dot(random3(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y), mix(mix(dot(random3(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)), dot(random3(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x), mix(dot(random3(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)), dot(random3(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x), u.y), u.z);
}

float cumFBM(vec3 p) {

    const int octaves = 4;
    float lacunarity = 1.6;
    float gain = 0.6;
			//
			// Initial values
    float amplitude = .50;
    float frequency = 2.0;
    float pMod = 0;
			//
			// Loop of octaves
    for(int i = 0; i < octaves; i++) {
        pMod += amplitude * (noise(frequency * p));
        frequency *= lacunarity;
        amplitude *= gain;
    }
    return pMod;

}

vec3 calcNormal(vec3 p) {
//Calculate three different vectors along the surface, based on the position being the normal vector. You can do this before the noise offsets.
// Using small steps along these, find three points around the vertex.
// Use these three, the “triangle method”, for finding the new normal.

    float delta = 1e-3; //distance to neighbors offset
 
    vec3 v1 = normalize(cross(p, vec3(1, 0, 0)));

    if(v1 == vec3(0, 0, 0)) {
        v1 = normalize(cross(p, vec3(0, 1, 0)));
    }

    vec3 v2 = normalize(cross(p, v1));
    vec3 v3 = normalize(-v1 - v2);

    vec3 p1 = v1 * delta + p;
    vec3 p2 = v2 * delta + p;
    vec3 p3 = v3 * delta + p;

    p1 = p1 + cumFBM(p1) * p1;
    p2 = p2 + cumFBM(p2) * p2;
    p3 = p3 + cumFBM(p3) * p3;

    vec3 s1 = (p2 - p1);
    vec3 s2 = (p3 - p2);
    vec3 nNew = cross(s1, s2);

    return normalize(nNew);

} //calcNormal

void computeVertex(int nr) {
    vec3 p, v1, v2, v3, p1, p2, p3, s1, s2, n;

    p = vec3(gl_in[nr].gl_Position);
	// Add interesting code here
    float pMod = cumFBM(p);
    vec3 normal = calcNormal(p);
    gl_Position = projMatrix * camMatrix * mdlMatrix * vec4(pMod * p + normalize(p), 1.0);
    height = pMod + normalize(p);

    gsTexCoord = teTexCoord[0];

    normal = teNormal[nr];
    gsNormal = mat3(camMatrix * mdlMatrix) * normal;
    EmitVertex();
}

void main() {

    computeVertex(0);
    computeVertex(1);
    computeVertex(2);
}

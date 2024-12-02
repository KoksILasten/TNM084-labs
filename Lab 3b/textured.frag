#version 150

out vec4 outColor;

in vec2 texCoord;
in vec3 exNormal;
uniform sampler2D tex;
in vec4 height;


void main(void)
{
	// Texture from disc
	vec4 t = texture(tex, texCoord);

	// Procedural texture
	t.r = sin(texCoord.s * 3.1416);
	t.g = sin(texCoord.t * 3.1416);
	t.b = sin((texCoord.s + texCoord.t) * 10.0);

	vec3 n = normalize(exNormal);
	float shade = n.y + n.z;
//	if (t.a < 0.01) discard;
//	else
    //outColor = t * shade * shade; // Over-emphasized fake light
    vec4 amog = normalize(height);

	//outColor = vec4(texCoord.s, texCoord.t, 0, 1);
	//outColor =+ vec4(n.x , .5, n.z, 1);
    //outColor =+ vec4(1) * shade;
    outColor =+ vec4(height.x*n.x * shade,n.y*height.y * shade,n.z*height.z *shade ,1);
    if(height.y < .5){
            outColor =+ vec4(0,0,1,1);
    }
    //outColor =+ height;
}

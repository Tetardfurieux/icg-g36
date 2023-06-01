precision highp float;

varying float v2f_height;

varying vec3 v2f_normal;
varying vec3 vertex_position;
varying vec3 v2f_light_position;


// Small perturbation to prevent "z-fighting" on the water on some machines...
const float terrain_water_level    = -0.03125 + 1e-6;
const vec3  terrain_color_water    = vec3(0.29, 0.51, 0.62);
const vec3  terrain_color_mountain = vec3(0.8, 0.5, 0.4);
const vec3  terrain_color_grass    = vec3(0.33, 0.43, 0.18);

// varying float value;

uniform int values[900];
uniform float times; // time multiplier

varying vec3 pos_out;

float modulo(float x, float y) {
	return x - (y * floor(x / y));
}

void main()
{
	vec3 light_color = times * vec3(1.0, 0.941, 0.898);

	vec3 ambient = 0.2 * light_color; // Ambient light intensity
	float height = v2f_height;

	vec3 material_color = terrain_color_grass; // Initial value
	float shininess = 0.5;

	
    float x = pos_out.x + 0.5;
    x *= 60.0;
    float y = pos_out.y + 0.5;
    y *= 60.0;

	float test = floor(x) + float(60) * floor(y);

	int index = int(test / 4.0);
	
	int modul = int(modulo(test, 4.0));

	float value = 0.0;

	for (int x = 0; x < 900; x++) {
		if (x == index) {
			value = float(values[x]);
		}
	}

	float mod10 = modulo(value, 10.0);
	float mod100 = modulo(value, 100.0);
	float mod1000 = modulo(value, 1000.0);



	if (modul == 3) {
		value = mod10;
	}
	else if (modul == 2) {
		value = mod100 / 10.0;
	}
	else if (modul == 1) {
		value = mod1000 / 100.0;
	}
	else if (modul == 0) {
		value = value / 1000.0;
	}


	if (int(value) == 0) {
		material_color = terrain_color_water;
		shininess = 30.;
	}
	else if (int(value) == 2) {
		material_color = terrain_color_grass;
		shininess = 2.;
	}
	else if (int(value) == 1) {
		material_color = terrain_color_mountain;
		shininess = 2.;
	}
	else if (int(value) == 3) {
		material_color = vec3(0.2, 0.2, 0.2);
		shininess = 2.;
	}
	else if (int(value) > 4) {
		material_color = vec3(1.0, 1.0, 1.0);
		shininess = 2.;
	}
	else {
		material_color = vec3(0.0, 0.0, 0.0);
	}

	vec3 light_dir = normalize(v2f_light_position - vertex_position);
	vec3 view_dir = normalize(-vertex_position);
	vec3 half_dir = normalize(light_dir + view_dir);

	float diffuse = max(dot(normalize(v2f_normal), light_dir), 0.0);
	float specular = pow(max(dot(normalize(v2f_normal), half_dir), 0.0), shininess);

	vec3 color = material_color * (ambient + light_color * (diffuse + specular));
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}

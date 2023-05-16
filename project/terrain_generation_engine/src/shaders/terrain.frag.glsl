precision highp float;

varying float v2f_height;

/* #TODO PG1.6.1: Copy Blinn-Phong shader setup from previous exercises */
varying vec3 v2f_normal;
varying vec3 vertex_position;
varying vec3 v2f_light_position;


const vec3  light_color = vec3(1.0, 0.941, 0.898);
// Small perturbation to prevent "z-fighting" on the water on some machines...
const float terrain_water_level    = -0.03125 + 1e-6;
const vec3  terrain_color_water    = vec3(0.29, 0.51, 0.62);
const vec3  terrain_color_mountain = vec3(0.8, 0.5, 0.4);
const vec3  terrain_color_grass    = vec3(0.33, 0.43, 0.18);

// varying float value;

uniform int values[3600];

varying vec3 pos_out;

void main()
{
	const vec3 ambient = 0.2 * light_color; // Ambient light intensity
	float height = v2f_height;

	/* #TODO PG1.6.1
	Compute the terrain color ("material") and shininess based on the height as
	described in the handout. `v2f_height` may be useful.
	
	Water:
			color = terrain_color_water
			shininess = 30.
	Ground:
			color = interpolate between terrain_color_grass and terrain_color_mountain, weight is (height - terrain_water_level)*2
	 		shininess = 2.
	*/
	vec3 material_color = terrain_color_grass; // Initial value
	float shininess = 0.5;

	
    float x = pos_out.x + 0.5;
    x *= 60.0;
    float y = pos_out.y + 0.5;
    y *= 60.0;

    // // float test = floor(x) + float(15) * floor(y);
    // float test = floor(position.x) + float(15) * floor(position.y);

    // value = float(values[int(test)]);

	int test = int(floor(x) + float(60) * floor(y));

	float value = 0.0;

	for (int x = 0; x < 3600; x++) {
		if (x == test) {
			value = float(values[x]);
		}
	}





	// if(height < terrain_water_level){
	if (int(value) == 0) {
		material_color = terrain_color_water;
		shininess = 30.;
	}
	else if (int(value) == 2) {
		material_color = terrain_color_grass;
		shininess = 2.;
	}
	else if (int(value) == 1) {
		// material_color = mix(terrain_color_grass, terrain_color_mountain, (height - terrain_water_level)*2.);
		material_color = terrain_color_mountain;
		shininess = 2.;
	}
	else if (int(value) == 3) {
		// material_color = mix(terrain_color_grass, terrain_color_mountain, (height - terrain_water_level)*2.);
		material_color = vec3(0.2, 0.2, 0.2);
		shininess = 2.;
	}
	else {
		material_color = vec3(0.0, 0.0, 0.0);
	}


	if (pos_out.x == floor(pos_out.x) && pos_out.y == floor(pos_out.y)) {
		material_color = vec3(1.0, 0.0, 0.0);
	}

	// material_color = vec3()


	/* #TODO PG1.6.1: apply the Blinn-Phong lighting model
    	Implement the Phong shading model by using the passed variables and write the resulting color to `color`.
    	`material_color` should be used as material parameter for ambient, diffuse and specular lighting.
    	Hints:
	*/
	vec3 light_dir = normalize(v2f_light_position - vertex_position);
	vec3 view_dir = normalize(-vertex_position);
	vec3 half_dir = normalize(light_dir + view_dir);

	float diffuse = max(dot(normalize(v2f_normal), light_dir), 0.0);
	float specular = pow(max(dot(normalize(v2f_normal), half_dir), 0.0), shininess);

	//vec3 color = material_color * light_color;
	vec3 color = material_color * (ambient + light_color * (diffuse + specular));
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}

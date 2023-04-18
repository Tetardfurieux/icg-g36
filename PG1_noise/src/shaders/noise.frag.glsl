// this version is needed for: indexing an array, const array, modulo %
precision highp float;

//=============================================================================
//	Exercise code for "Introduction to Computer Graphics 2018"
//     by
//	Krzysztof Lis @ EPFL
//=============================================================================

#define NUM_GRADIENTS 12

// -- Gradient table --
vec2 gradients(int i) {
	if (i ==  0) return vec2( 1,  1);
	if (i ==  1) return vec2(-1,  1);
	if (i ==  2) return vec2( 1, -1);
	if (i ==  3) return vec2(-1, -1);
	if (i ==  4) return vec2( 1,  0);
	if (i ==  5) return vec2(-1,  0);
	if (i ==  6) return vec2( 1,  0);
	if (i ==  7) return vec2(-1,  0);
	if (i ==  8) return vec2( 0,  1);
	if (i ==  9) return vec2( 0, -1);
	if (i == 10) return vec2( 0,  1);
	if (i == 11) return vec2( 0, -1);
	return vec2(0, 0);
}

float hash_poly(float x) {
	return mod(((x*34.0)+1.0)*x, 289.0);
}

// -- Hash function --
// Map a gridpoint to 0..(NUM_GRADIENTS - 1)
int hash_func(vec2 grid_point) {
	return int(mod(hash_poly(hash_poly(grid_point.x) + grid_point.y), float(NUM_GRADIENTS)));
}

// -- Smooth interpolation polynomial --
// Use mix(a, b, blending_weight_poly(t))
float blending_weight_poly(float t) {
	return t*t*t*(t*(t*6.0 - 15.0)+10.0);
}


// Constants for FBM
const float freq_multiplier = 2.17;
const float ampl_multiplier = 0.5;
const int num_octaves = 4;

// ==============================================================
// 1D Perlin noise evaluation and plotting

float perlin_noise_1d(float x) {
	/*
	Note Gradients gradients(i) from in the table are 2d, so in the 1D case we use grad.x
	*/

	/* #TODO PG1.2.1
	Evaluate the 1D Perlin noise function at "x" as described in the handout. 
	You will determine the two grid points surrounding x, 
	look up their gradients, 
	evaluate the the linear functions these gradients describe, 
	and interpolate these values 
	using the smooth interolation polygnomial blending_weight_poly.
	*/
	int a = int(floor(x));
	int b = a + 1;
	float t_a = x - float(a);
	float t_b = x - float(b);
	vec2 grad_a = gradients(hash_func(vec2(a, 0)));
	vec2 grad_b = gradients(hash_func(vec2(b, 0)));
	float contri_a = grad_a.x * t_a;
	float contri_b = grad_b.x * t_b;
	float noise = mix(contri_a, contri_b, blending_weight_poly(t_a));

	return noise;
}

float perlin_fbm_1d(float x) {
	/* #TODO PG1.3.1
	Implement 1D fractional Brownian motion (fBm) as described in the handout.
	You should add together num_octaves octaves of Perlin noise, starting at octave 0. 
	You also should use the frequency and amplitude multipliers:
	freq_multiplier and ampl_multiplier defined above to rescale each successive octave.
	
	Note: the GLSL `for` loop may be useful.
	*/
	float fbm = 0.;
	for(int i = 0; i < num_octaves; i++) {
		fbm +=  pow(ampl_multiplier, float(i)) * perlin_noise_1d(x * pow(freq_multiplier, float(i)));
	}
	return fbm;
}

// ----- plotting -----

const vec3 plot_foreground = vec3(0.5, 0.8, 0.5);
const vec3 plot_background = vec3(0.2, 0.2, 0.2);

vec3 plot_value(float func_value, float coord_within_plot) {
	return (func_value < ((coord_within_plot - 0.5)*2.0)) ? plot_foreground : plot_background;
}

vec3 plots(vec2 point) {
	// Press D (or right arrow) to scroll

	// fit into -1...1
	point += vec2(1., 1.);
	point *= 0.5;

	if(point.y < 0. || point.y > 1.) {
		return vec3(255, 0, 0);
	}

	float y_inv = 1. - point.y;
	float y_rel = y_inv / 0.2;
	int which_plot = int(floor(y_rel));
	float coord_within_plot = fract(y_rel);

	vec3 result;
	if(which_plot < 4) {
		result = plot_value(
 			perlin_noise_1d(point.x * pow(freq_multiplier, float(which_plot))),
			coord_within_plot
		);
	} else {
		result = plot_value(
			perlin_fbm_1d(point.x) * 1.5,
			coord_within_plot
		);
	}

	return result;
}

// ==============================================================
// 2D Perlin noise evaluation


float perlin_noise(vec2 point) {
	/* #TODO PG1.4.1
	Implement 2D perlin noise as described in the handout.
	You may find a glsl `for` loop useful here, but it's not necessary.
	*/
	vec2 s = floor(point);
	vec2 t = s + vec2(1., 0.);
	vec2 u = s + vec2(0., 1.);
	vec2 v = s + vec2(1., 1.);

	vec2 grad_s = gradients(hash_func(s));
	vec2 grad_t = gradients(hash_func(t));
	vec2 grad_u = gradients(hash_func(u));
	vec2 grad_v = gradients(hash_func(v));

	vec2 a = point - s;
	vec2 b = point - t;
	vec2 c = point - u;
	vec2 d = point - v;

	float contri_s = dot(grad_s, a);
	float contri_t = dot(grad_t, b);
	float contri_u = dot(grad_u, c);
	float contri_v = dot(grad_v, d);

	float st = mix(contri_s, contri_t, blending_weight_poly(a.x));
	float uv = mix(contri_u, contri_v, blending_weight_poly(a.x));
	float noise = mix(st, uv, blending_weight_poly(a.y));
	return noise;
}

vec3 tex_perlin(vec2 point) {
	// Visualize noise as a vec3 color
	float freq = 23.15;
 	float noise_val = perlin_noise(point * freq) + 0.5;
	return vec3(noise_val);
}

// ==============================================================
// 2D Fractional Brownian Motion

float perlin_fbm(vec2 point) {
	/* #TODO PG1.4.2
	Implement 2D fBm as described in the handout. Like in the 1D case, you
	should use the constants num_octaves, freq_multiplier, and ampl_multiplier. 
	*/
	float fbm = 0.;
	for(int i = 0; i < num_octaves; i++) {
		fbm +=  pow(ampl_multiplier, float(i)) * perlin_noise(point * pow(freq_multiplier, float(i)));
	}
	return fbm;
}

vec3 tex_fbm(vec2 point) {
	// Visualize noise as a vec3 color
	float noise_val = perlin_fbm(point) + 0.5;
	return vec3(noise_val);
}

vec3 tex_fbm_for_terrain(vec2 point) {
	// scale by 0.25 for a reasonably shaped terrain
	// the +0.5 transforms it to 0..1 range - for the case of writing it to a non-float textures on older browsers or GLES3
	float noise_val = (perlin_fbm(point) * 0.25) + 0.5;
	return vec3(noise_val);
}

// ==============================================================
// 2D turbulence

float turbulence(vec2 point) {
	/* #TODO PG1.4.3
	Implement the 2D turbulence function as described in the handout.
	Again, you should use num_octaves, freq_multiplier, and ampl_multiplier.
	*/
	float turbulence = 0.;
	for(int i = 0; i < num_octaves; i++) {
		turbulence +=  pow(ampl_multiplier, float(i)) * abs(perlin_noise(point * pow(freq_multiplier, float(i))));
	}
	return turbulence;
}

vec3 tex_turbulence(vec2 point) {
	// Visualize noise as a vec3 color
	float noise_val = turbulence(point);
	return vec3(noise_val);
}

// ==============================================================
// Procedural "map" texture

const float terrain_water_level = -0.075;
const vec3 terrain_color_water = vec3(0.29, 0.51, 0.62);
const vec3 terrain_color_grass = vec3(0.43, 0.53, 0.23);
const vec3 terrain_color_mountain = vec3(0.8, 0.7, 0.7);

vec3 tex_map(vec2 point) {
	/* #TODO PG1.5.1.1
	Implement your map texture evaluation routine as described in the handout. 
	You will need to use your perlin_fbm routine and the terrain color constants described above.
	*/
	float fbm = perlin_fbm(point);

	if(fbm < terrain_water_level){
		return terrain_color_water;
	}
	else {
		return mix(terrain_color_grass, terrain_color_mountain, fbm - terrain_water_level);
	}
}

// ==============================================================
// Procedural "wood" texture

const vec3 brown_dark 	= vec3(0.48, 0.29, 0.00);
const vec3 brown_light 	= vec3(0.90, 0.82, 0.62);

vec3 tex_wood(vec2 point) {
	/* #TODO PG1.5.1.2
	Implement your wood texture evaluation routine as described in thE handout. 
	You will need to use your 2d turbulence routine and the wood color constants described above.
	*/
	float turbulences = turbulence(point);
	float alpha = 0.5 * (1. + sin(100. * (length( point) + 0.15 * turbulences)));
	return mix(brown_dark, brown_light, alpha);
}


// ==============================================================
// Procedural "marble" texture

const vec3 white 			= vec3(0.95, 0.95, 0.95);

vec3 tex_marble(vec2 point) {
	/* #TODO PG1.5.1.3
	Implement your marble texture evaluation routine as described in the handout.
	You will need to use your 2d fbm routine and the marble color constants described above.
	*/
	vec2 q = vec2(perlin_fbm(point), perlin_fbm(point + vec2(1.7, 4.6))); 
	float alpha = 0.5 * (1.0 + perlin_fbm(point + 4.0 * q));
	return mix(brown_dark, white, alpha);
}



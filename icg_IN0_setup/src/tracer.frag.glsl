precision highp float;

#define MAX_RANGE 1e6

#define NUM_SPHERES inject-num-spheres
uniform vec4 spheres_center_radius[NUM_SPHERES]; // ...[i] = [center_x, center_y, center_z, radius]

// materials
#define NUM_MATERIALS inject-num-materials
struct Material {
	vec3 color;
	float ambient;
	float diffuse;
	float specular;
	float shininess;
	float mirror;
};
uniform Material materials[NUM_MATERIALS];
uniform int object_material_id[NUM_SPHERES];

// lights
#define NUM_LIGHTS inject-num-lights
struct Light {
	vec3 color;
	vec3 position;
};
uniform Light lights[NUM_LIGHTS];
uniform vec3 light_color_ambient;


varying vec2 v2f_tex_coord;
varying vec3 v2f_ray_direction;

/*
	Solve the quadratic a*x^2 + b*x + c = 0
*/
int solve_quadratic(float a, float b, float c, out vec2 solutions) {

	// Linear case: bx+c = 0
	if (abs(a) < 1e-10) {
		if (abs(b) < 1e-10) {
			// no solutions
			return 0; 
		} else {
			// 1 solution: -c/b
			solutions[0] = - c / b;
			return 1;
		}
	} else {
		float delta = b * b - 4. * a * c;

		if (delta < 0.) {
			// no solutions in real numbers, sqrt(delta) produces an imaginary value
			return 0;
		} 

		// Avoid cancellation:
		// One solution doesn't suffer cancellation:
		//      a * x1 = 1 / 2 [-b - bSign * sqrt(b^2 - 4ac)]
		// "x2" can be found from the fact:
		//      a * x1 * x2 = c
		float a_x1 = -0.5 * (b + sqrt(delta) * sign(b));

		solutions[0] = a_x1 / a;
		solutions[1] = c / a_x1;

		// 2 solutions
		return 2;
	} 
}

/*
	Check for intersection of the ray with a given sphere in the scene.
*/

bool ray_sphere_intersection(
		vec3 ray_origin, vec3 ray_direction, 
		vec3 sphere_center, float sphere_radius, 
		out float t, out vec3 normal) 
{
	vec3 oc = ray_origin - sphere_center;

	vec2 solutions; // solutions will be stored here

	int num_solutions = solve_quadratic(
		// A: t^2 * ||d||^2 = dot(ray_direction, ray_direction) but ray_direction is normalized
		1., 
		// B: t * (2d dot (o - c))
		2. * dot(ray_direction, oc),	
		// C: ||o-c||^2 - r^2				
		dot(oc, oc) - sphere_radius*sphere_radius,
		// where to store solutions
		solutions
	);

	// result = distance to collision
	// MAX_RANGE means there is no collision found
	t = MAX_RANGE+10.;
	bool collision_happened = false;

	// If there are more than one solution and both of the intersections are in front of the camera
	if (num_solutions >= 1 && solutions[0] > 0.) {
		t = solutions[0];
	}
	
	// If there are two solutions and only one of them is in front of the camera
	if (num_solutions >= 2 && solutions[1] > 0. && solutions[1] < t) {
		t = solutions[1];
	}

	// If there has been an intersection with the sphere, we record its position and normal
	if (t < MAX_RANGE) {
		vec3 intersection_point = ray_origin + ray_direction * t;
		normal = (intersection_point - sphere_center) / sphere_radius;

		return true;
	} else {
		return false;
	}	
}

/*
	Check for intersection of the ray with any object in the scene.
*/
bool ray_intersection(
		vec3 ray_origin, vec3 ray_direction, 
		out float col_distance, out vec3 col_normal, out int material_id) 
{
	col_distance = MAX_RANGE + 10.;
	col_normal = vec3(0., 0., 0.);

	float object_distance;
	vec3 object_normal;

	// Check for intersection with each sphere
	for(int i = 0; i < NUM_SPHERES; i++) {
		bool b_col = ray_sphere_intersection(
			ray_origin, 
			ray_direction, 
			spheres_center_radius[i].xyz, 
			spheres_center_radius[i][3], 
			object_distance, 
			object_normal
		);

		// choose this collision if its closer than the previous one
		if (b_col && object_distance < col_distance) {
			col_distance = object_distance;
			col_normal = object_normal;
			//object_id = i;
			material_id =  object_material_id[i];
		}
	}

	return col_distance < MAX_RANGE;
}

/*
	Get the material corresponding to mat_id from the list of materials.
	This loop is necessary to avoid running into the exception 'Index expression must be constant'
	Try it yourself by commenting out the code and copying/pasting:

		Material m = materials[mat_id];
		return m;
*/
Material get_mat2(int mat_id) {
	Material m = materials[0];
	for(int mi = 1; mi < NUM_MATERIALS; mi++) {
		if(mi == mat_id) {
			m = materials[mi];
		}
	}
	return m;
}

void main() {

	vec3 ray_origin = vec3(0.);
	vec3 ray_direction = normalize(v2f_ray_direction);

	vec3 pix_color = vec3(0.);

	// outputs from collision function
	float col_distance;
	vec3 col_normal = vec3(0.);
	int mat_id = 0;

	// Check if our ray has hit an object
	if( ray_intersection(ray_origin, ray_direction, col_distance, col_normal, mat_id) ) {
		
		// material of the intersected object
		Material m = get_mat2(mat_id);

		// use color of the material
		pix_color = m.ambient * m.color;

	} else {
		// #TODO IN0.1: Set your background color here
		pix_color = vec3(0., 0., 0.);
	}

	gl_FragColor = vec4(pix_color, 1.);

	// vec3 my_color = 2*vec3(0.5, 0, 0);
	// vec3 my_color = vec3(ray_direction.x, ray_direction.y. 0);
	// gl_FragColor = vec4(my_color, 1.);
}

// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_position;
attribute vec3 vertex_normal;

// Per-vertex outputs passed on to the fragment shader

/* #TODO GL2.3
	Pass the values needed for per-pixel
	Create a vertex-to-fragment variable.
*/
varying vec3 eye_space_position;
varying vec3 eye_space_normal;
varying vec3 eye_space_light_position;
varying vec3 gL_FragColor;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_to_view;

uniform vec3 light_position; //in camera space coordinates already

uniform vec3 material_color;
uniform float material_shininess;
uniform vec3 light_color;

void main() {
	float material_ambient = 0.1;

	/** #TODO GL2.3 Gouraud lighting
	Compute the visible object color based on the Blinn-Phong formula.

	Hint: Compute the vertex position, normal and light_position in eye space.
	Hint: Write the final vertex position to gl_Position
	*/
	eye_space_position = vec3(mat_model_view * vec4(vertex_position, 1));
	eye_space_normal = mat_normals_to_view * vertex_normal;
	eye_space_light_position = light_position - eye_space_position;

	vec3 N = normalize(eye_space_normal);
	vec3 L = normalize(eye_space_light_position);
	vec3 V = normalize(-eye_space_position);
	vec3 H = normalize(L + V);

	vec3 diffuse = max(dot(N, L), 0.0) * light_color;
	vec3 specular = pow(max(dot(N, H), 0.0), material_shininess) * light_color;
	vec3 ambient = material_ambient * light_color;

	vec3 color = material_color * (ambient + diffuse + specular);


	gl_Position = mat_mvp * vec4(vertex_position, 1);

	gL_FragColor = color;



}

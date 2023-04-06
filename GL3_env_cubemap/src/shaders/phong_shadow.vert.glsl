// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_position;
attribute vec3 vertex_normal;
attribute vec2 vertex_tex_coords;


// Per-vertex outputs passed on to the fragment shader

varying vec3 v2f_normal;
varying vec3 v2f_dir_to_camera;
varying vec2 v2f_uv;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_to_view;

void main() {
	v2f_uv = vertex_tex_coords;

	/** #TODO GL3.3.1
	Setup all outgoing variables so that you can compute in the fragment shader
    the phong lighting. You will need to setup all the uniforms listed above, before you
    can start coding this shader.
	* surface normal
	* vertex position in camera coordinates
    Hint: Compute the vertex position, normal and light_position in eye space.
    Hint: Write the final vertex position to gl_Position
    */
	// viewing vector (from camera to vertex in view coordinates), camera is at vec3(0, 0, 0) in cam coords
	// vertex position in camera coordinates
	// transform normal to camera coordinates
	vec3 vertex_position_view = (mat_model_view * vec4(vertex_position, 1)).xyz;
	v2f_dir_to_camera = vertex_position_view;
	
	v2f_normal = mat_normals_to_view * vertex_normal;

	v2f_normal = normalize(v2f_normal);
	v2f_dir_to_camera = normalize(v2f_dir_to_camera);
	
	gl_Position = mat_mvp * vec4(vertex_position, 1);

}

// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_position;
attribute vec3 vertex_normal;

// Per-vertex outputs passed on to the fragment shader

/* #TODO GL2.2.1
	Pass the normal to the fragment shader. 
	Create a vertex-to-fragment variable.
*/
//varying ...

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_to_view;

void main() {

	/* #TODO GL2.2.1 
		Pass the normal to the fragment shader. 
		Assign your vertex-to-fragment varaiable.
	*/
	/* #TODO GL2.2.2
		Transform the normals to camera space.
	*/

	gl_Position = mat_mvp * vec4(vertex_position, 1);
}

attribute vec3 position;
attribute vec3 normal;

varying float v2f_height;

varying vec3 v2f_normal;
varying vec3 vertex_position;
varying vec3 v2f_light_position;

uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals; // mat3 not 4, because normals are only rotated and not translated

uniform vec4 light_position; //in camera space coordinates already


varying vec3 pos_out;

void main()
{
    v2f_height = position.z;
    vec4 position_v4 = vec4(position, 1);

	// Setup Blinn-Phong varying variables
    vec3 eye_space_position = vec3(mat_model_view * position_v4);
	vec3 eye_space_normal = mat_normals * normal;

	v2f_normal = eye_space_normal;
	vertex_position = eye_space_position;
    v2f_light_position = vec3(light_position);
	
	gl_Position = mat_mvp * position_v4;
    pos_out = position;
}

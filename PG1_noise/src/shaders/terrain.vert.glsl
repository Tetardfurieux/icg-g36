attribute vec3 position;
attribute vec3 normal;

varying float v2f_height;

/* #TODO PG1.6.1: Copy Blinn-Phong shader setup from previous exercises */
varying vec3 v2f_normal;
varying vec3 vertex_position;
varying vec3 v2f_light_position;

uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals; // mat3 not 4, because normals are only rotated and not translated

uniform vec4 light_position; //in camera space coordinates already


// get array of float from uniform
// uniform int values[225];

varying vec3 pos_out;

void main()
{
    v2f_height = position.z;
    vec4 position_v4 = vec4(position, 1);

    /** #TODO PG1.6.1:
	Setup all outgoing variables so that you can compute in the fragmend shader
    the phong lighting. You will need to setup all the uniforms listed above, before you
    can start coding this shader.

    Hint: Compute the vertex position, normal and light_position in eye space.
    Hint: Write the final vertex position to gl_Position
    */
	// Setup Blinn-Phong varying variables
	//v2f_normal = normal; // TODO apply normal transformation
    vec3 eye_space_position = vec3(mat_model_view * position_v4);
	vec3 eye_space_normal = mat_normals * normal;
    //vec3 eye_light_position = vec3(mat_model_view * light_position);


	v2f_normal = eye_space_normal;
	vertex_position = eye_space_position;
    v2f_light_position = vec3(light_position);
	
	// gl_Position = vec4(values[0]);
	gl_Position = mat_mvp * position_v4;




    // float x = position.x + 0.5;
    // x *= 15.0;
    // float y = position.y + 0.5;
    // y *= 15.0;

    // // float test = floor(x) + float(15) * floor(y);
    // float test = floor(position.x) + float(15) * floor(position.y);

    // value = float(values[int(test)]);




    pos_out = position;
}

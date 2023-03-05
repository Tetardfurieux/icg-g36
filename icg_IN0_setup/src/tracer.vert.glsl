
uniform vec2 field_of_view_xy;

attribute vec2 vertex_position;

varying vec2 v2f_tex_coord;
varying vec3 v2f_ray_direction;

void main() {
	v2f_tex_coord = (1. + vertex_position) * 0.5;
	v2f_ray_direction = vec3(tan(field_of_view_xy * 0.5) * vertex_position, 1.);

	gl_Position = vec4(vertex_position, 0., 1.);
}

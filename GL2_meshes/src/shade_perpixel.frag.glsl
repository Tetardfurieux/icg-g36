precision mediump float;

/* #TODO GL2.4
	Setup the varying values needed to compue the Phong shader:
	* surface normal
	* lighting vector: direction to light
	* view vector: direction to camera
*/
//varying ...
//varying ...
//varying ...
varying vec3 normal;
varying vec3 light_direction;
varying vec3 view_direction;

uniform vec3 material_color;
uniform float material_shininess;
uniform vec3 light_color;

void main()
{
	float material_ambient = 0.1;

	/*
	/* #TODO GL2.4: Apply the Blinn-Phong lighting model

	Implement the Blinn-Phong shading model by using the passed
	variables and write the resulting color to `color`.
	
	Make sure to normalize values which may have been affected by interpolation!
	*/
	vec3 color = material_color * (material_ambient + light_color * max(dot(normalize(normal), normalize(light_direction)), 0.0) + light_color * pow(max(dot(normalize(normal), normalize(light_direction + view_direction)), 0.0), material_shininess));
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}

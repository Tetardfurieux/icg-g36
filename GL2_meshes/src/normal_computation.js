
import * as vec3 from "../lib/gl-matrix_3.3.0/esm/vec3.js"

function get_vert(mesh, vert_id) {
	const offset = vert_id*3
	return  mesh.vertex_positions.slice(offset, offset+3)
}

function compute_triangle_normals_and_angle_weights(mesh) {

	/** #TODO GL2.1.1: 
	- compute the normal vector to each triangle in the mesh
	- push it into the array `tri_normals`
	- compute the angle weights for vert1, vert2, then vert3 and store it into an array [w1, w2, w3]
	- push this array into `angle_weights`

	Hint: you can use `vec3` specific methods such as `normalize()`, `add()`, `cross()`, `angle()`, or `subtract()`.
		  The absolute value of a float is given by `Math.abs()`.
	*/

	const num_faces     = (mesh.faces.length / 3) | 0
	const tri_normals   = []
	const angle_weights = []
	for(let i_face = 0; i_face < num_faces; i_face++) {
		const vert1 = get_vert(mesh, mesh.faces[3*i_face + 0])
		const vert2 = get_vert(mesh, mesh.faces[3*i_face + 1])
		const vert3 = get_vert(mesh, mesh.faces[3*i_face + 2])
		
		// Modify the way triangle normals and angle_weights are computed

		let edge_1 = vec3.subtract([0., 0., 0.], vert2, vert1)
		let edge_2 = vec3.subtract([0., 0., 0.], vert3, vert1)
		let edge_3 = vec3.subtract([0., 0., 0.], vert1, vert2)
		let normal = (vec3.cross([0., 0., 0.], edge_1, edge_2))
		normal = vec3.normalize(normal, normal)
		tri_normals.push(normal)

		angle_weights.push([vec3.angle(edge_2, edge_3), vec3.angle(edge_3, edge_1), vec3.angle(edge_1, edge_2)])


	}
	return [tri_normals, angle_weights]
}

function compute_vertex_normals(mesh, tri_normals, angle_weights) {

	/** #TODO GL2.1.2: 
	- go through the triangles in the mesh
	- add the contribution of the current triangle to its vertices' normal
	- normalize the obtained vertex normals
	*/

	const num_faces    = (mesh.faces.length / 3) | 0
	const num_vertices = (mesh.vertex_positions.length / 3) | 0
	const vertex_normals = Array.from({length: num_vertices}, () => [0., 0., 0.]) // fill with 0 vectors

	for(let i_face = 0; i_face < num_faces; i_face++) {
		const iv1 = mesh.faces[3*i_face + 0]
		const iv2 = mesh.faces[3*i_face + 1]
		const iv3 = mesh.faces[3*i_face + 2]

		const normal = tri_normals[i_face]

		// Add your code for adding the contribution of the current triangle to its vertices' normals

		vertex_normals[iv1] = vec3.add([0., 0., 0.], vertex_normals[iv1], vec3.scale([0., 0., 0.], normal, angle_weights[i_face][0]))
		vertex_normals[iv2] = vec3.add([0., 0., 0.], vertex_normals[iv2], vec3.scale([0., 0., 0.], normal, angle_weights[i_face][1]))
		vertex_normals[iv3] = vec3.add([0., 0., 0.], vertex_normals[iv3], vec3.scale([0., 0., 0.], normal, angle_weights[i_face][2]))



	}

	for(let i_vertex = 0; i_vertex < num_vertices; i_vertex++) {
		// Normalize the vertices

		vertex_normals[i_vertex] = vec3.normalize([0., 0., 0.], vertex_normals[i_vertex])
	}

	return vertex_normals
}

export function mesh_preprocess(regl, mesh) {
	const [tri_normals, angle_weights] = compute_triangle_normals_and_angle_weights(mesh)
			
	const vertex_normals = compute_vertex_normals(mesh, tri_normals, angle_weights)

	mesh.vertex_positions = regl.buffer({data: mesh.vertex_positions, type: 'float32'})
	mesh.vertex_normals = regl.buffer({data: vertex_normals, type: 'float32'})
	mesh.faces = regl.elements({data: mesh.faces, type: 'uint16'})

	return mesh
}

import {load_text} from "./icg_web.js"
import {Mesh} from "../lib/webgl-obj-loader_2.0.8/webgl-obj-loader.module.js"

/*
	Mesh construction and loading
*/

export function icg_mesh_make_uv_sphere(divisions, inverted) {
	const {sin, cos, PI} = Math;

	const v_resolution = divisions | 0; // tell optimizer this is an int
	const u_resolution = 2*divisions;
	const n_vertices = v_resolution * u_resolution;
	const n_triangles = 2 * (v_resolution-1) * (u_resolution - 1);

	const vertex_positions = [];
	const tex_coords = [];

	for(let iv = 0; iv < v_resolution; iv++) {
		const v = iv / (v_resolution-1);
		const phi = v * PI;
		const sin_phi = sin(phi)
		const cos_phi = cos(phi)

		for(let iu = 0; iu < u_resolution; iu++) {
			const u = iu / (u_resolution-1);

			const theta = 2*u*PI


			vertex_positions.push([
				cos(theta) * sin_phi,
				sin(theta) * sin_phi,
				cos_phi, 
			])

			tex_coords.push([
				u,
				v,
			])
		}
	}

	const faces = [];

	for(let iv = 0; iv < v_resolution-1; iv++) {
		for(let iu = 0; iu < u_resolution-1; iu++) {
			const i0 = iu + iv * u_resolution;
			const i1 = iu + 1 + iv * u_resolution;
			const i2 = iu + 1 + (iv+1) * u_resolution;
			const i3 = iu + (iv+1) * u_resolution;

			if (!inverted) {
				faces.push([i0, i1, i2])
				faces.push([i0, i2, i3])
			} else {
				faces.push([i0, i2, i1])
				faces.push([i0, i3, i2])
			}
		}
	}

	const normals = inverted ? vertex_positions.map((pos) => vec3.negate(vec3.create(), pos)) : vertex_positions

	return {
		name: `UvSphere(${divisions})`,
		vertex_positions: vertex_positions,
		vertex_normals: normals, // on a unit sphere, position is equivalent to normal
		vertex_tex_coords: tex_coords,
		faces: faces,
	}
}


export async function icg_mesh_load_obj(url, material_colors_by_name) {
	const obj_data = await load_text(url)
	const mesh_loaded_obj = new Mesh(obj_data)

	const faces_from_materials = [].concat(...mesh_loaded_obj.indicesPerMaterial)
	
	let vertex_colors = null

	if(material_colors_by_name) {
		const material_colors_by_index = mesh_loaded_obj.materialNames.map((name) => {
			let color = material_colors_by_name[name];
			if (color === undefined) {
				console.warn(`Missing color for material ${name} in mesh ${url}`);
				color = [1., 0., 1.];
			}
			return color;
		})

		vertex_colors = [].concat(mesh_loaded_obj.vertexMaterialIndices.map((mat_idx) => material_colors_by_index[mat_idx]))
		// vertex_colors = regl_instance.buffer(vertex_colors)
	}
	
	return  {
		name: url.split('/').pop(),
		vertex_positions: mesh_loaded_obj.vertices,
		vertex_tex_coords: mesh_loaded_obj.textures,
		vertex_normals: mesh_loaded_obj.vertexNormals,
		vertex_colors: vertex_colors,
		
		// https://github.com/regl-project/regl/blob/master/API.md#elements
		faces: faces_from_materials,
		
		lib_obj: mesh_loaded_obj,
	}
}

/*
	Put mesh data into a GPU buffer

	It is not necessary to do so (regl can deal with normal arrays),
	but this way we make sure its transferred only once and not on every pipeline construction.
*/
export function mesh_upload_to_buffer(regl, mesh) {
	
	const mesh_buffers = {
		name: mesh.name,
		faces: regl.elements({data: mesh.faces, type: 'uint16'}),
	}

	
	// Some of these fields may be null or undefined
	for(const name of ['vertex_positions', 'vertex_normals', 'vertex_tex_coords', 'vertex_colors']) {
		const vertex_data = mesh[name]
		if(vertex_data) {
			mesh_buffers[name] = regl.buffer(vertex_data)
		}
	}

	return mesh_buffers
}

export async function icg_mesh_load_obj_into_regl(regl_instance, url, material_colors_by_name) {
	const mesh_cpu = await icg_mesh_load_obj(url, material_colors_by_name)
	const mesh_gpu = mesh_upload_to_buffer(regl_instance, mesh_cpu)
	return mesh_gpu
}


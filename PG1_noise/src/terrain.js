import {mat3, mat4, vec3} from "../lib/gl-matrix_3.3.0/esm/index.js"
import {mat4_matmul_many} from "./icg_math.js"

class BufferData {

	constructor(regl, buffer) {
		this.width = buffer.width
		this.height = buffer.height
		this.data = regl.read({framebuffer: buffer})

		// this can read both float and uint8 buffers
		if (this.data instanceof Uint8Array) {
			// uint8 array is in range 0...255
			this.scale = 1./255.
		} else {
			this.scale = 1.
		}

	}

	get(x, y) {
		x = Math.min(Math.max(x, 0), this.width - 1)
		y = Math.min(Math.max(y, 0), this.height - 1)

		return this.data[x + y*this.width << 2] * this.scale
	}
}

function check_bottom(current, under) {
	for (let i = 0; i < 3; ++i) {
		if (current[i][2] !== under[i][0]) {
			return false
		}
	}
	return true
}

function check_top(current, above) {
	for (let i = 0; i < 3; ++i) {
		if (current[i][0] !== above[i][2]) {
			return false
		}
	}
	return true
}

function check_left(current, left) {
	for (let i = 0; i < 3; ++i) {
		if (current[0][i] !== left[2][i]) {
			return false
		}
	}
	return true
}

function check_right(current, right) {
	for (let i = 0; i < 3; ++i) {
		if (current[2][i] !== right[0][i]) {
			return false
		}
	}
	return true
}

function check_converged(candidates) {
	for (let i = 0; i < candidates.length; ++i) {
		if (candidates[i].length >= 1) {
			return false
		}
	}
	console.log("converged")
	return true
}


function compute_candidates(tileset, map, candidates, x, y) {
	let result = []
	if (candidates[x][y].length === 0) {
		return result
	}
	for (let i = 0; i < tileset.length; ++i) {
		let candidate = tileset[i]
		let valid = true
		if (x > 0 && candidates[x - 1][y].length === 0 && !check_left(candidate, map[x - 1][y])) {
			valid = false
		}
		if (x < map.length - 1 && candidates[x + 1][y].length === 0 && !check_right(candidate, map[x + 1][y])) {
			valid = false
		}
		if (y > 0 && candidates[x][y - 1].length === 0 && !check_top(candidate, map[x][y - 1])) {
			valid = false
		}
		if (y < map[0].length - 1 && candidates[x][y + 1].length === 0 && !check_bottom(candidate, map[x][y + 1])) {
			valid = false
		}

		if (valid) {
			result.push(candidate)
		}

	}
	return result

}

function wfc_build_mesh(height_map) {
	let grid_width = 5 // height_map.width
	let grid_height = 5 // height_map.height

	const WATER_LEVEL = -0.03125

	// let map be an array of 3x3 arrays of ints
	let tileset = []
	tileset.push([[0, 0, 0], [0, 0, 0], [0, 0, 0]]) // empty
	/*tileset.push([[0, 1, 0], [1, 1, 1], [0, 1, 0]]) // full
	tileset.push([[0, 0, 0], [0, 1, 1], [0, 0, 0]]) // right
	tileset.push([[0, 0, 0], [1, 1, 0], [0, 0, 0]]) // left
	tileset.push([[0, 1, 0], [0, 1, 0], [0, 0, 0]]) // top
	tileset.push([[0, 0, 0], [0, 1, 0], [0, 1, 0]]) // bottom
	tileset.push([[0, 1, 0], [0, 1, 1], [0, 0, 0]]) // top right
	tileset.push([[0, 1, 0], [1, 1, 0], [0, 0, 0]]) // top left
	tileset.push([[0, 0, 0], [1, 1, 0], [0, 1, 0]]) // bottom left
	tileset.push([[0, 0, 0], [0, 1, 0], [0, 1, 1]]) // bottom right
	tileset.push([[0, 1, 0], [0, 1, 0], [0, 1, 0]]) // top bottom
	tileset.push([[0, 0, 0], [1, 1, 1], [0, 0, 0]]) // left right
	tileset.push([[0, 1, 0], [0, 1, 1], [0, 1, 0]]) // top right bottom
	tileset.push([[0, 1, 0], [1, 1, 0], [0, 1, 0]]) // top left bottom
	tileset.push([[0, 1, 0], [1, 1, 1], [0, 0, 0]]) // top left right
	tileset.push([[0, 0, 0], [1, 1, 1], [0, 1, 0]]) // bottom left right

	tileset.push([[0, 0, 0], [0, 0, 0], [0, 0, 0]]) // empty
	tileset.push([[0, 2, 0], [2, 2, 2], [0, 2, 0]]) // full
	tileset.push([[0, 0, 0], [0, 2, 2], [0, 0, 0]]) // right
	tileset.push([[0, 0, 0], [2, 2, 0], [0, 0, 0]]) // left
	tileset.push([[0, 2, 0], [0, 2, 0], [0, 0, 0]]) // top
	tileset.push([[0, 0, 0], [0, 2, 0], [0, 2, 0]]) // bottom
	tileset.push([[0, 2, 0], [0, 2, 2], [0, 0, 0]]) // top right
	tileset.push([[0, 2, 0], [2, 2, 0], [0, 0, 0]]) // top left
	tileset.push([[0, 0, 0], [2, 2, 0], [0, 2, 0]]) // bottom left
	tileset.push([[0, 0, 0], [0, 2, 0], [0, 2, 2]]) // bottom right
	tileset.push([[0, 2, 0], [0, 2, 0], [0, 2, 0]]) // top bottom
	tileset.push([[0, 0, 0], [2, 2, 2], [0, 0, 0]]) // left right
	tileset.push([[0, 2, 0], [0, 2, 2], [0, 2, 0]]) // top right bottom
	tileset.push([[0, 2, 0], [2, 2, 0], [0, 2, 0]]) // top left bottom
	tileset.push([[0, 2, 0], [2, 2, 2], [0, 0, 0]]) // top left right
	tileset.push([[0, 0, 0], [2, 2, 2], [0, 2, 0]]) // bottom left right*/
	tileset.push([[0, 0, 0], [1, 1, 1], [1, 1, 1]])
	tileset.push([[1, 1, 1], [1, 1, 1], [1, 1, 1]])
	tileset.push([[1, 1, 1], [1, 1, 1], [0, 0, 0]])
	tileset.push([[0, 1, 1], [0, 1, 1], [0, 1, 1]])
	tileset.push([[1, 1, 0], [1, 1, 0], [1, 1, 0]])

	tileset.push([[2, 2, 2], [2, 2, 2], [2, 2, 2]])
	tileset.push([[0, 0, 0], [2, 2, 2], [2, 2, 2]])
	tileset.push([[2, 2, 2], [2, 2, 2], [0, 0, 0]])
	tileset.push([[0, 2, 2], [0, 2, 2], [0, 2, 2]])
	tileset.push([[2, 2, 0], [2, 2, 0], [2, 2, 0]])

	



	let candidates = Array.from(Array(grid_width), () => new Array(grid_height))

	let map = Array.from(Array(grid_width), () => new Array(grid_height))

	let x = Math.floor(Math.random() * grid_width)
	let y = Math.floor(Math.random() * grid_height)


	// console.log(x, y)

	for (let i = 0; i < grid_width; ++i) {
		for (let j = 0; j < grid_height; ++j) {
			// if (i === x && j === y) {
			// 	map[i][j] = tileset[1]
			// 	candidates[i][j] = []
			// }
			// else {
			// 	map[i][j] = []
			// 	candidates[i][j] = tileset
			// }
			
			map[i][j] = tileset[0]
			candidates[i][j] = tileset
		}
	}

	let count = 0
	while (!check_converged(candidates)) {
		if (count > 100) {
			console.log("failed")
			break
		}
		count++
		// console.log(count)

		for (let i = 0; i < grid_width; ++i) {
			for (let j = 0; j < grid_height; ++j) {
				if (candidates[i][j] > 0) {
					candidates[i][j] = compute_candidates(tileset, map, candidates, i, j)
				}
			}
		}
		let foundMin = false
		for (let k = 1; k <= tileset.length; k++) {
			if (foundMin) {
				break
			}
			for (let i = 0; i < grid_width; ++i) {
				if (foundMin) { //TODO
					break
				}
				for (let j = 0; j < grid_height; ++j) {
					// console.log(candidates[i][j].length)
					if (candidates[i][j].length === k) {
						let r = Math.floor(Math.random() * candidates[i][j].length)
						// console.log(i, j, r)
						// console.log(candidates[i][j][r])
						map[i][j] = candidates[i][j][r]
						// console.log(map)
						candidates[i][j] = []
						foundMin = true
						break
					}
				}
			}

		}

	}

	// console.log("done")

	// console.log(map)
	let drawMap = Array.from(Array(3*grid_width), () => new Array(3*grid_height))
	let values = []

	for (let i = 0; i < 3*grid_width; ++i) {
		for (let j = 0; j < 3*grid_height; ++j) {
			drawMap[i][j] = []
		}
	}

	for (let i = 0; i < grid_width; ++i) {
		for (let j = 0; j < grid_height; ++j) {
			for (let k = 0; k < 3; k++) {
				for (let l = 0; l < 3; l++) {
					drawMap[i*3+k][j*3+l] = map[i][j][k][l]
				}
			}
		}
	}


	for (let i = 0; i < 3*grid_height; ++i) {
		let line = ""
		for (let j = 0; j < 3*grid_width; ++j) {
			line += drawMap[i][j]
			values.push(drawMap[j][i])
		}
		console.log(line)
	}


	grid_width = 3*grid_width
	grid_height = 3*grid_height

	const vertices = []
	const normals = []
	const faces = []

	// Map a 2D grid index (x, y) into a 1D index into the output vertex array.
	function xy_to_v_index(x, y) {
		return x + y*grid_width
	}

	for(let gy = 0; gy < grid_height; gy++) {
		for(let gx = 0; gx < grid_width; gx++) {
			const idx = xy_to_v_index(gx, gy)
			let elevation = height_map.get(gx, gy) - 0.5 // we put the value between 0...1 so that it could be stored in a non-float texture on older browsers/GLES3, the -0.5 brings it back to -0.5 ... 0.5

			// normal as finite difference of the height map
			// dz/dx = (h(x+dx) - h(x-dx)) / (2 dx)
			normals[idx] = vec3.normalize([0, 0, 0], [
				-(height_map.get(gx+1, gy) - height_map.get(gx-1, gy)) / (2. / grid_width),
				-(height_map.get(gx, gy+1) - height_map.get(gx, gy-1)) / (2. / grid_height),
				1.,
			])

			/* #TODO PG1.6.1
			Generate the displaced terrain vertex corresponding to integer grid location (gx, gy). 
			The height (Z coordinate) of this vertex is determined by height_map.
			If the point falls below WATER_LEVEL:
			* it should be clamped back to WATER_LEVEL.
			* the normal should be [0, 0, 1]

			The XY coordinates are calculated so that the full grid covers the square [-0.5, 0.5]^2 in the XY plane.
			*/
			let z = height_map.get(gx, gy) - 0.5;
			/*if (z < WATER_LEVEL) {
				z = WATER_LEVEL;
				normals[idx] = [0, 0, 1];
			}*/
			let va = xy_to_v_index(gx, gy);
			let vb = xy_to_v_index(gx + 1, gy);
			let vc = xy_to_v_index(gx, gy + 1);
			let vd = xy_to_v_index(gx + 1, gy + 1);

			if(drawMap[gx][gy] === 0) {
				z = WATER_LEVEL;
				/*vertices[va] = [gx / grid_width - 0.5, gy / grid_height - 0.5, z];
				vertices[vb] = [(gx + 1)/ grid_width - 0.5, gy / grid_height - 0.5, z];
				vertices[vc] = [gx / grid_width - 0.5, (gy + 1) / grid_height - 0.5, z];
				vertices[vd] = [(gx + 1)/ grid_width - 0.5, (gy + 1) / grid_height - 0.5, z];*/
				normals[idx] = [0, 0, 1];
			}
			else if(drawMap[gx][gy] === 1) {
				z = 0.;
				normals[idx] = [0, 0, 1];
			}
			else{
				z = 0.;
				normals[idx] = [0, 0, 1];
			}

			//vertices[idx] = [gx, gy, z];
			//if(drawMap[gx][gy] !== 0) {
				vertices[idx] = [gx / grid_width - 0.5, gy / grid_height - 0.5, z];
			//}
		}
	}

	for(let gy = 0; gy < grid_height - 1; gy++) {
		for(let gx = 0; gx < grid_width - 1; gx++) {
			/* #TODO PG1.6.1
			Triangulate the grid cell whose lower lefthand corner is grid index (gx, gy).
			You will need to create two triangles to fill each square.
			*/
			let va = xy_to_v_index(gx, gy);
			let vb = xy_to_v_index(gx + 1, gy);
			let vc = xy_to_v_index(gx, gy + 1);
			let vd = xy_to_v_index(gx + 1, gy + 1);
			faces.push([va, vb, vc]);
			faces.push([vb, vd, vc]);
			// faces.push([v1, v2, v3]) // adds a triangle on vertex indices v1, v2, v3
		}
	}

	console.log(vertices)

	return {
		vertex_positions: vertices,
		vertex_normals: normals,
		faces: faces,
		vertex_values: values,
	}
}

function terrain_build_mesh(height_map) {
	const grid_width = height_map.width
	const grid_height = height_map.height

	const WATER_LEVEL = -0.03125

	const vertices = []
	const normals = []
	const faces = []

	// Map a 2D grid index (x, y) into a 1D index into the output vertex array.
	function xy_to_v_index(x, y) {
		return x + y*grid_width
	}

	for(let gy = 0; gy < grid_height; gy++) {
		for(let gx = 0; gx < grid_width; gx++) {
			const idx = xy_to_v_index(gx, gy)
			let elevation = height_map.get(gx, gy) - 0.5 // we put the value between 0...1 so that it could be stored in a non-float texture on older browsers/GLES3, the -0.5 brings it back to -0.5 ... 0.5

			// normal as finite difference of the height map
			// dz/dx = (h(x+dx) - h(x-dx)) / (2 dx)
			normals[idx] = vec3.normalize([0, 0, 0], [
				-(height_map.get(gx+1, gy) - height_map.get(gx-1, gy)) / (2. / grid_width),
				-(height_map.get(gx, gy+1) - height_map.get(gx, gy-1)) / (2. / grid_height),
				1.,
			])

			/* #TODO PG1.6.1
			Generate the displaced terrain vertex corresponding to integer grid location (gx, gy).
			The height (Z coordinate) of this vertex is determined by height_map.
			If the point falls below WATER_LEVEL:
			* it should be clamped back to WATER_LEVEL.
			* the normal should be [0, 0, 1]

			The XY coordinates are calculated so that the full grid covers the square [-0.5, 0.5]^2 in the XY plane.
			*/
			let z = height_map.get(gx, gy) - 0.5;
			if (z < WATER_LEVEL) {
				z = WATER_LEVEL;
				normals[idx] = [0, 0, 1];
			}
			vertices[idx] = [gx / grid_width - 0.5, gy / grid_height - 0.5, z];
		}
	}

	for(let gy = 0; gy < grid_height - 1; gy++) {
		for(let gx = 0; gx < grid_width - 1; gx++) {
			/* #TODO PG1.6.1
			Triangulate the grid cell whose lower lefthand corner is grid index (gx, gy).
			You will need to create two triangles to fill each square.
			*/
			let va = xy_to_v_index(gx, gy);
			let vb = xy_to_v_index(gx + 1, gy);
			let vc = xy_to_v_index(gx, gy + 1);
			let vd = xy_to_v_index(gx + 1, gy + 1);
			faces.push([va, vb, vc]);
			faces.push([vb, vd, vc]);
			// faces.push([v1, v2, v3]) // adds a triangle on vertex indices v1, v2, v3
		}
	}

	return {
		vertex_positions: vertices,
		vertex_normals: normals,
		faces: faces,
	}
}


export function init_terrain(regl, resources, height_map_buffer) {

	const terrain_mesh = wfc_build_mesh(new BufferData(regl, height_map_buffer))

	const pipeline_draw_terrain = regl({
		attributes: {
			position: terrain_mesh.vertex_positions,
			normal: terrain_mesh.vertex_normals,
		},
		uniforms: {
			mat_mvp: regl.prop('mat_mvp'),
			mat_model_view: regl.prop('mat_model_view'),
			mat_normals: regl.prop('mat_normals'),

			light_position: regl.prop('light_position'),
			values: terrain_mesh.vertex_values,
		},
		elements: terrain_mesh.faces,

		vert: resources['shaders/terrain.vert.glsl'],
		frag: resources['shaders/terrain.frag.glsl'],
	})


	class TerrainActor {
		constructor() {
			this.mat_mvp = mat4.create()
			this.mat_model_view = mat4.create()
			this.mat_normals = mat3.create()
			this.mat_model_to_world = mat4.create()
		}

		draw({mat_projection, mat_view, light_position_cam}) {
			mat4_matmul_many(this.mat_model_view, mat_view, this.mat_model_to_world)
			mat4_matmul_many(this.mat_mvp, mat_projection, this.mat_model_view)
	
			mat3.fromMat4(this.mat_normals, this.mat_model_view)
			mat3.transpose(this.mat_normals, this.mat_normals)
			mat3.invert(this.mat_normals, this.mat_normals)
	
			pipeline_draw_terrain({
				mat_mvp: this.mat_mvp,
				mat_model_view: this.mat_model_view,
				mat_normals: this.mat_normals,
		
				light_position: light_position_cam,
			})
		}
	}

	return new TerrainActor()
}

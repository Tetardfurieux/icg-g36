
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
	for (let i = 0; i < tileset.length; ++i) {
		let candidate = tileset[i]
		let valid = true
		if (x > 0 && map[x - 1][y].length > 0 && !check_left(candidate, tileset[map[x - 1][y]])) {
			valid = false
		}
		if (x < map.length - 1 && map[x + 1][y].length > 0 && !check_right(candidate, tileset[map[x + 1][y]])) {
			valid = false
		}
		if (y > 0 &&  map[x][y - 1].length > 0 && !check_top(candidate, tileset[map[x][y - 1]])) {
			valid = false
		}
		if (y < map[0].length - 1 && map[x][y + 1].length > 0 && !check_bottom(candidate, tileset[map[x][y + 1]])) {
			valid = false
		}

		if (valid) {
			result.push(i)
		}

	}
	return result

}

function wfc_build_mesh(height_map, initialTilesArray) {

	let grid_width = 20 // height_map.width
	let grid_height = 20 // height_map.height

	const WATER_LEVEL = -0.03125

	// let map be an array of 3x3 arrays of ints
	let tileset = []

	// FULL
	tileset.push([[0, 0, 0], [0, 0, 0], [0, 0, 0]]) // 0
	tileset.push([[2, 2, 2], [2, 2, 2], [2, 2, 2]]) // 1

	// LINE TRANSITIONS
	tileset.push([[0, 0, 0], [1, 1, 1], [2, 2, 2]]) // 2
	tileset.push([[2, 2, 2], [1, 1, 1], [0, 0, 0]])	// 3
	tileset.push([[0, 1, 2], [0, 1, 2], [0, 1, 2]])	// 4
	tileset.push([[2, 1, 0], [2, 1, 0], [2, 1, 0]])	// 5

	// CORNER TRANSITIONS CONVEX
	tileset.push([[0, 0, 0], [0, 1, 1], [0, 1, 2]]) // 6
	tileset.push([[0, 0, 0], [1, 1, 0], [2, 1, 0]]) // 7
	tileset.push([[0, 1, 2], [0, 1, 1], [0, 0, 0]]) // 8
	tileset.push([[2, 1, 0], [1, 1, 0], [0, 0, 0]]) // 9

	tileset.push([[2, 2, 2], [2, 1, 1], [2, 1, 0]]) // 6
	tileset.push([[2, 2, 2], [1, 1, 2], [0, 1, 2]]) // 7
	tileset.push([[2, 1, 0], [2, 1, 1], [2, 2, 2]]) // 8
	tileset.push([[0, 1, 2], [1, 1, 2], [2, 2, 2]]) // 9

	// ROADS
	tileset.push([[2, 3, 2], [3, 3, 3], [2, 3, 2]]) // 10
	tileset.push([[2, 3, 2], [2, 3, 2], [2, 3, 2]]) // 11
	tileset.push([[2, 2, 2], [3, 3, 3], [2, 2, 2]]) // 12

	// ROAD ENDS
	tileset.push([[2, 3, 2], [2, 3, 2], [2, 2, 2]]) // 13
	tileset.push([[2, 2, 2], [2, 3, 2], [2, 3, 2]]) // 14
	tileset.push([[2, 2, 2], [2, 3, 3], [2, 2, 2]]) // 15
	tileset.push([[2, 2, 2], [3, 3, 2], [2, 2, 2]]) // 16

	// ROAD TURNS
	tileset.push([[2, 3, 2], [3, 3, 2], [2, 2, 2]]) // 17
	tileset.push([[2, 2, 2], [3, 3, 2], [2, 3, 2]]) // 18
	tileset.push([[2, 3, 2], [2, 3, 3], [2, 2, 2]]) // 19
	tileset.push([[2, 2, 2], [2, 3, 3], [2, 3, 2]]) // 20

	let adjacencies = []

	for (let i = 0; i < tileset.length; ++i) {
		adjacencies.push([10, 100, 1, 1, 1, 1, 1, 1, 1, 1, /*10*/  1, 1, 1, 1, 5, 5, 5, 5, 5, 5, /*20*/ 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
	}

	let candidates = Array.from(Array(grid_width), () => new Array(grid_height))
	let map = null;

	if(initialTilesArray){
		// fill up the map with the existing tiles
		map = initialTilesArray;
		console.log(map);

		// compute the map candidates 
		for (let i = 0; i < grid_width; ++i) {
			for (let j = 0; j < grid_height; ++j) {

				if (map[i][j].length != 0) {
					candidates[i][j] = []
				}else {
					candidates[i][j] = compute_candidates(tileset, map, candidates, i, j)
				}
			}
		}
	}else{
		map = Array.from(Array(grid_width), () => new Array(grid_height));

		for (let i = 0; i < grid_width; ++i) {
			for (let j = 0; j < grid_height; ++j) {
				if (i === 10 && j === 10) {
					map[i][j] = [7]
				}
				else {
					map[i][j] = []
				}
	
			}
		}

		for (let i = 0; i < grid_width; ++i) {
			for (let j = 0; j < grid_height; ++j) {
				if (i === 10 && j === 10) {
					candidates[i][j] = []
				}
				else {
					candidates[i][j] = compute_candidates(tileset, map, candidates, i, j)
				}
			}
		}	
	}


	let count = 0
	while (!check_converged(candidates)) {
		if (count >= 500) {
			console.log("failed")
			break
		}
		count++

		for (let i = 0; i < grid_width; ++i) {
			for (let j = 0; j < grid_height; ++j) {
				if (candidates[i][j].length > 0) {
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
				if (foundMin) {
					break
				}
				for (let j = 0; j < grid_height; ++j) {
					if (candidates[i][j].length === k) {
						let r = Math.floor(Math.random() * candidates[i][j].length)

						let neighbors = []
						if (i > 0 && map[i - 1][j].length > 0) {
							neighbors.push(map[i - 1][j][0])
						}
						if (i < grid_width - 1 && map[i + 1][j].length > 0) {
							neighbors.push(map[i + 1][j][0])
						}
						if (j > 0 && map[i][j - 1].length > 0) {
							neighbors.push(map[i][j - 1][0])
						}
						if (j < grid_height - 1 && map[i][j + 1].length > 0) {
							neighbors.push(map[i][j + 1][0])
						}

						// map the candidates to their adjacencies
						let scores = []
						for (let c = 0; c < candidates[i][j].length; ++c) {
							let score = 0
							for (let n = 0; n < neighbors.length; ++n) {
								score += adjacencies[neighbors[n]][candidates[i][j][c]]
							}
							scores.push(score)
						}


						// select the candidates with the highest score
						let weighted_candidates = []
						for (let c = 0; c < candidates[i][j].length; ++c) {
							for (let s = 0; s < scores[c]; ++s) {
								weighted_candidates.push(candidates[i][j][c])
							}
						}

						r = Math.floor(Math.random() * weighted_candidates.length)

						map[i][j] = [weighted_candidates[r]]
						candidates[i][j] = []
						foundMin = true
						break
					}
				}
			}

		}

	}

	var tileMap = Array.from(Array(grid_width), () => new Array(grid_height));
	for (let i = 0; i < grid_width; ++i) {
		for (let j = 0; j < grid_height; ++j) {
			tileMap[i][j] = map[i][j];
		}
	}

	for (let i = 0; i < grid_width; ++i) {
		for (let j = 0; j < grid_height; ++j) {
			if (map[i][j].length === 0) {
				map[i][j] = [[4, 4, 4], [4, 4, 4], [4, 4, 4]]
			}
			else {
				map[i][j] = tileset[map[i][j]]
			}
		}
	}

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

			// normal as finite difference of the height map
			// dz/dx = (h(x+dx) - h(x-dx)) / (2 dx)
			normals[idx] = vec3.normalize([0, 0, 0], [
				-(height_map.get(gx+1, gy) - height_map.get(gx-1, gy)) / (2. / grid_width),
				-(height_map.get(gx, gy+1) - height_map.get(gx, gy-1)) / (2. / grid_height),
				1.,
			])

			let z = height_map.get(gx, gy) - 0.5;
			let va = xy_to_v_index(gx, gy);
			let vb = xy_to_v_index(gx + 1, gy);
			let vc = xy_to_v_index(gx, gy + 1);
			let vd = xy_to_v_index(gx + 1, gy + 1);

			if(drawMap[gx][gy] === 0) {
				z = WATER_LEVEL;
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

			if (gx > 0 && drawMap[gx - 1][gy] === 0) {
				z = WATER_LEVEL;
			}
			if (gy > 0 && drawMap[gx][gy - 1] === 0) {
				z = WATER_LEVEL;
			}

			vertices[idx] = [gx / grid_width - 0.5, gy / grid_height - 0.5, z];
		}
	}

	for(let gy = 0; gy < grid_height - 1; gy++) {
		for(let gx = 0; gx < grid_width - 1; gx++) {
			let va = xy_to_v_index(gx, gy);
			let vb = xy_to_v_index(gx + 1, gy);
			let vc = xy_to_v_index(gx, gy + 1);
			let vd = xy_to_v_index(gx + 1, gy + 1);
			faces.push([va, vb, vc]);
			faces.push([vb, vd, vc]);
		}
	}

	console.log(vertices)

	let valuesCompressed = []
	for (let i = 0; i < values.length; i += 4) {
		valuesCompressed.push(values[i] * 1000 + values[i + 1] * 100 + values[i + 2] * 10 + values[i + 3])
	}

	return {
		vertex_positions: vertices,
		vertex_normals: normals,
		faces: faces,
		vertex_values: valuesCompressed,
		map : drawMap,
		tile_map : tileMap
	}
}


export function init_terrain(regl, resources, height_map_buffer, initialTilesArray) {

	const terrain_mesh = wfc_build_mesh(new BufferData(regl, height_map_buffer), initialTilesArray)
	let day_night_b = false;
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
			times: () => {
				if(day_night_b) return updateDayNightCycle()
				else return 1.0
			},
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

		draw({mat_projection, mat_view, light_position_cam, day_night}) {
			mat4_matmul_many(this.mat_model_view, mat_view, this.mat_model_to_world)
			mat4_matmul_many(this.mat_mvp, mat_projection, this.mat_model_view)

			mat3.fromMat4(this.mat_normals, this.mat_model_view)
			mat3.transpose(this.mat_normals, this.mat_normals)
			mat3.invert(this.mat_normals, this.mat_normals)
			day_night_b = day_night

			pipeline_draw_terrain({
				mat_mvp: this.mat_mvp,
				mat_model_view: this.mat_model_view,
				mat_normals: this.mat_normals,

				light_position: light_position_cam,
			})
		}
	}

	return {
		terrain_actor : new TerrainActor(),
		terrain_map : terrain_mesh.map,
		tile_map : terrain_mesh.tile_map
	};

	
}

/*---------------------------------------------------------------
		Day Night Cycle
	---------------------------------------------------------------*/
function updateDayNightCycle(day) {
	if(day) return 1.0;
    var currentTime = new Date();
    var seconds = currentTime.getTime() / 1000;
	let r = Math.min(1, Math.max(Math.sin(seconds - Math.PI/2.0) + 1, 0.2));

    return r;
}



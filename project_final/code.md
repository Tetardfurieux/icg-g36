# Code 

## WFC

### terrain.js

```js
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
```

### terrain.frag.glsl

```glsl
float x = pos_out.x + 0.5;
x *= 60.0;
float y = pos_out.y + 0.5;
y *= 60.0;
float test = floor(x) + float(60) * floor(y);
int index = int(test / 4.0);

int modul = int(modulo(test, 4.0));
float value = 0.0;
for (int x = 0; x < 900; x++) {
	if (x == index) {
		value = float(values[x]);
	}
}
float mod10 = modulo(value, 10.0);
float mod100 = modulo(value, 100.0);
float mod1000 = modulo(value, 1000.0);
if (modul == 3) {
	value = mod10;
}
else if (modul == 2) {
	value = mod100 / 10.0;
}
else if (modul == 1) {
	value = mod1000 / 100.0;
}
else if (modul == 0) {
	value = value / 1000.0;
}
if (int(value) == 0) {
	material_color = terrain_color_water;
	shininess = 30.;
}
else if (int(value) == 2) {
	material_color = terrain_color_grass;
	shininess = 2.;
}
else if (int(value) == 1) {
	material_color = terrain_color_mountain;
	shininess = 2.;
}
else if (int(value) == 3) {
	material_color = vec3(0.2, 0.2, 0.2);
	shininess = 2.;
}
else if (int(value) > 4) {
	material_color = vec3(1.0, 1.0, 1.0);
	shininess = 2.;
}
else {
	material_color = vec3(0.0, 0.0, 0.0);
}
```

## Mini Map HTML

The Html : 

```html
<div id="minimap">
	<p> Terrain minimap </p>
	<canvas id="map_visual"></canvas>
	<div class="tools">
		<div id="editTools">
			<img id="edit1" alt="edit_mode1" src="ressources/edit mode 1.svg" />
			<img id="edit2" alt="edit_mode2" src="ressources/edit mode 2.svg" />
		</div>
		<div id="validerOrCancel"> 
			<img id="valider" alt="valider" src="ressources/valider.svg" />
			<img id="cancel" alt="cancel" src="ressources/cancel.svg" />
		</div>
	</div>
	<div id="availableTiles"> 
		<p> The available tiles </p>
	</div>
</div>
```

The css : 

```css
/*
    This file contains the css code for the minimap
*/
#minimap
{
    z-index : 2;
    position : absolute; 
    top : 10px;
    right : 10px;
    
    width : fit-content;
    height: fit-content;

    color : white;
    background-color: rgb(114, 114, 127);
    border : 3px solid rgb(17, 17, 17);
    border-radius: 10px;
    padding : 10px;

    cursor: move;
}

#minimap p
{
    color : white;
    text-align: center;
    margin : 0px;
    margin-bottom: 5px;
}

#map_visual
{
    width : 300px;
    height : 300px;

    border : 3px solid rgb(17, 17, 17);
    background-color: white;
    cursor : grab;
}

.tools
{
    width : 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items : center;
}

#zoomTools, #editTools, #validerOrCancel
{
    width : wrap;
}
#validerOrCancel
{
    display: none;
}

#zoomIn, #zoomOut, #edit1, #edit2, #edit3, #valider, #cancel, #back_to_edit, #move
{
    cursor : pointer;
    height : 45px;
    transition : transform 200ms;
    &:hover
    {
        transform : scale(1.2);
        transition : 50ms;
    }
    &:active
    {
    transform : scale(1);
    }
}
#availableTiles
{
    display : none;
    margin-block : 1em;
    border : 3px solid rgb(17, 17, 17);
}
#move, #back_to_edit
{
    display : none;
    margin-left : 10px;
}
```

## Minimap Interactivity

```js
const map = document.getElementById('minimap');

var isMinimapVisible = true;

const minimap = document.getElementById('map_visual');

const validationTools = document.getElementById("validerOrCancel");
const availableTiles = document.getElementById("availableTiles");

const edit1 = document.getElementById('edit1');
const edit2 = document.getElementById('edit2');
	
const valider = document.getElementById('valider');
const cancel = document.getElementById('cancel');

/* return tile index of the tile under the mouse cursor */
function tileAtMouseCursorIndex(mouseEvent){
	let boundingRect = minimap.getBoundingClientRect();
	let xWithinCanvas = mouseEvent.pageX - boundingRect.left;
	let yWithinCanvas = mouseEvent.pageY - boundingRect.top;

	return {
		x: Math.floor(xWithinCanvas/ map_DIM * map_width),
		y: Math.floor(yWithinCanvas / map_DIM * map_height)
	};
}

/* FSM state variables */
var inEditorMode = false;

/* handle clicks on the map */
var selectedTiles = []; // for mode 1 and 2  
var composition = []; // for mode 3

	
function handleMinimapClick(mouseEvent){
	if(inEditorMode){
		switch(editMode){
			case 1 :
			case 2 :
				// select tiles to conserve / remove 
				var selectedTile = tileAtMouseCursorIndex(mouseEvent);
				for(let index in selectedTiles){
					var tileIndex = selectedTiles[index];
					if(tileIndex.x == selectedTile.x && tileIndex.y == selectedTile.y){
						selectedTiles.splice(index,1);
						return;
					}
				}
				selectedTiles.push(selectedTile);
				break;										
			case 3 :
				// pose tiles 
				break;
		}
	}
}
minimap.addEventListener('click', (event) => {
	handleMinimapClick(event);
});
	
/* handle mouse move on the map */
var tileIndex = null;
minimap.addEventListener("mousemove", mouseEvent => {
	if(inEditorMode){
		var tileIndexPointedByMouse = tileAtMouseCursorIndex(mouseEvent)
		if(tileIndex == null){
			tileIndex = tileIndexPointedByMouse;
			switch(editMode){
				case 1:
					drawTile(tileIndexPointedByMouse.x*TILE_SIZE,tileIndexPointedByMouse.y*TILE_SIZE,tileIndexPointedByMouse.x,tileIndexPointedByMouse.y,true);
					break;
				case 2:
					drawTile(tileIndexPointedByMouse.x*TILE_SIZE,tileIndexPointedByMouse.y*TILE_SIZE,tileIndexPointedByMouse.x,tileIndexPointedByMouse.y,false);
					break;
				case 3 : 
					break;
			}	
		}else{
			if(tileIndex.x != tileIndexPointedByMouse.x || tileIndex.y != tileIndexPointedByMouse.y){
				var isTileSelected = false;
				if(editMode == 1 || editMode == 2){
					for(let tile of selectedTiles){
						if(tile.x == tileIndex.x && tile.y == tileIndex.y){
							isTileSelected = true;
							break;
						}
					}
				}

				switch(editMode){
					case 1:
						drawTile(tileIndex.x*TILE_SIZE,tileIndex.y*TILE_SIZE,tileIndex.x,tileIndex.y,isTileSelected);
						break;
					case 2:
						drawTile(tileIndex.x*TILE_SIZE,tileIndex.y*TILE_SIZE,tileIndex.x,tileIndex.y,!isTileSelected);
						break;
					case 3 : 
						break;
				}

				tileIndex = tileIndexPointedByMouse;
				switch(editMode){
					case 1:
						drawTile(tileIndexPointedByMouse.x*TILE_SIZE,tileIndexPointedByMouse.y*TILE_SIZE,tileIndexPointedByMouse.x,tileIndexPointedByMouse.y,true);
						break;
					case 2:
						drawTile(tileIndexPointedByMouse.x*TILE_SIZE,tileIndexPointedByMouse.y*TILE_SIZE,tileIndexPointedByMouse.x,tileIndexPointedByMouse.y,false);
						break;
					case 3 : 
						break;
				}
			}
		}
	}
});


var editMode = 0;
function edit(mode){
	inEditorMode = true;
	minimap.style.cursor = "crosshair";
	editTools.style.display = "none";
	validationTools.style.display = "block";
	switch(mode){
		case 1 :
			editMode = 1;
			drawMap(false);
			break;
		case 2 : 
			editMode = 2;
			break;
		case 3:
			editMode = 3;
			availableTiles.style.display = "block";
			break;
	}
}
edit1.addEventListener('click', () => {
	edit(1);
});
edit2.addEventListener('click', () => {
	edit(2);
});

function regenerate(){
	inEditorMode = false;
	minimap.style.cursor = "grab";
	editTools.style.display = "block";
	validationTools.style.display = "none";
	availableTiles.style.display = "none";
	selectedTiles = [];

	generateTerrain(null);
	update_needed=true;
	render();
	drawMap(true);
}

function regenerateFromArray(initTileArray){
	generateTerrain(initTileArray);
	update_needed=true;
	render();
	drawMap(true);
}
	
var intervall = null;
var diaporamaRunning = false;

function keyPressAction(event){
	switch(event.key){
		// minimap hide / display 
		case 'm':
			if(isMinimapVisible){
				map.style.display = "none";
			}else{
				map.style.display = "block";
			}
			isMinimapVisible = !isMinimapVisible;
			break;
		case 'r':
			regenerate()
			break;
		case 'n':
			day_night_cycle = !day_night_cycle;
			break;
		case '': 
			break;
	}
}
document.addEventListener("keypress", event => {
	keyPressAction(event);
})

function validerOrCancel(mode){
	minimap.style.cursor = "grab";
	editTools.style.display = "block";
	validationTools.style.display = "none";
	availableTiles.style.display = "none";

	console.log(selectedTiles);


	switch(mode){
		case 1 :
			// valider
			switch(editMode){
				case 1:
					for(let i = 0; i<map_width; i++){
						for(let j=0; j<map_width; j++){
							var found = false;
							for(let tileIndex in selectedTiles){
								var tile = selectedTiles[tileIndex];
								if(i == (map_width - 1 - tile.x) && tile.y == j){
									found = true;
									tileIndex = selectedTiles.length;
								}
							}
							if(!found){
								tile_map[i][j] = [];
							}
						}
					}	
					break;
				case 2 :
					for(var selectedTile of selectedTiles){
						tile_map[map_width - 1 - selectedTile.x][selectedTile.y] = [];
					} 
					break;
				case 3 :
					break;
				};
			regenerateFromArray(tile_map);
		case 2 :
			// cancel
			drawMap(true);
			break;
	}
	selectedTiles = [];
	composition = [];
	inEditorMode = false;
}
valider.addEventListener('click', () => {
	validerOrCancel(1);
});
cancel.addEventListener('click', () => {
	validerOrCancel(2);
});
	

/* minimap drawing */
const drawingContext = minimap.getContext("2d");

const map_DIM = 300;
minimap.width = map_DIM;
minimap.height = map_DIM;

const roadColor = "rgb(127, 100, 100)";
const waterColor = "rgb(79, 202, 227)";
const grassColor = "rgb(154, 217, 138)";
const sandColor = "rgb(240, 191, 70)";

const roadColorClair = "rgb(214, 199, 199)";
const waterColorClair = "rgb(171, 209, 217)";
const grassColorClair = "rgb(197, 214, 193)";
const sandColorClair = "rgb(240, 233, 223)";

const DIM_CELL = (map_DIM/map_width)/3;
const TILE_SIZE = map_DIM/map_width;

var currentScale = 1; // x1, x2, x4, x8
var topLeftIndex = {x:0, y:0};

/* Mapping between the tile array and the map */ 
function tileIndexToArrayIndex(x,y){
	// the problems this mapping is intending to solve :
	//	- the 3D visual isn't a direct representation of the tile array
	// 	  instead the tiles in 3D are symetrically opposed to the tile array
	//  - the array granularity is at the sub tiles scale (with micro cells), 
	// 	  while manipulating the greate tile abstraction might come handy 
		
	var tileIndexX = (map_width - 1 - x)*3;
	var tileIndexY = y*3;

	return {x: tileIndexX,y: tileIndexY};
}

function drawTile(canvasX, canvasY, tileIndexX, tileIndexY, hasFoccus){
	var tilePositionInArray = tileIndexToArrayIndex(tileIndexX, tileIndexY);
	for(let i = 0; i < 3; i++){
		for(let j = 0; j < 3; j++){
			var cellIndexX = tilePositionInArray.x + (2 - i);
			var cellIndexY = tilePositionInArray.y + j;

			var tileCell = terrain_map[cellIndexX][cellIndexY];
			if(hasFoccus){
				switch(tileCell){
					case 0:
						drawingContext.fillStyle = waterColor;
						break;
					case 1:
						drawingContext.fillStyle = sandColor;
						break;
					case 2:
						drawingContext.fillStyle = grassColor;
						break;
					case 3 :
						drawingContext.fillStyle = roadColor;
						break;
					default :
						break;
				}
			}else{
				switch(tileCell){
					case 0:
						drawingContext.fillStyle = waterColorClair;
						break;
					case 1:
						drawingContext.fillStyle = sandColorClair;
						break;
					case 2:
						drawingContext.fillStyle = grassColorClair;
						break;
					case 3 :
						drawingContext.fillStyle = roadColorClair;
						break;
					default :
						break;
				}
			}
			drawingContext.fillRect(canvasX + i*DIM_CELL, canvasY + j*DIM_CELL, DIM_CELL, DIM_CELL);
		}
	}
}

function drawMap(colored){
	// make use of the currentScale and the centeredOn to display 
	// the map properly
	for(let i = 0; i < map_width; i++){
		for(let j = 0; j < map_height; j++){
			drawTile(i*TILE_SIZE,j*TILE_SIZE,i,j,colored);
		}
	}
}

window.addEventListener("resize", event => {
	minimap.width = map_DIM;
	minimap.height = map_DIM;
	drawMap(true);
})
```

## Day/Night cycle

### terrain.js

```js
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
```


### main_terrain.js

```js
case 'n':
day_night_cycle = !day_night_cycle;
break;
const d = new Date();
			let time = d.getTime() / 1000.;	
			const scene_info = {
				mat_view:        mat_view,
				mat_projection:  mat_projection,
				light_position_cam: light_position_cam,
				day_night: day_night_cycle,
			}
			// If we're in day/night cycle mode, clear to a color that depends on the current time
			if(day_night_cycle){
			let background_color =  Math.min(1, Math.max(Math.sin(time - Math.PI/2.0) + 1, 0.2));
			regl.clear({color: [background_color, background_color, background_color, 1]})
			}
			else{
				regl.clear({color: [0.9, 0.9, 1., 1]}) // clear to white
			}
setInterval(() => { // update 
	update_needed = true
	render()
}, 1000/60)
```

### terrain.frag.glsl

```glsl
vec3 light_color = times * vec3(1.0, 0.941, 0.898);
```
    
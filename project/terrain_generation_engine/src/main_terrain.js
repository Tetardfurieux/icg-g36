import {createREGL} from "../lib/regljs_2.1.0/regl.module.js"
import {vec2, vec3, vec4, mat2, mat3, mat4} from "../lib/gl-matrix_3.3.0/esm/index.js"

import {DOM_loaded_promise, load_text, register_button_with_hotkey, register_keyboard_action} from "./icg_web.js"
import {deg_to_rad, mat4_to_string, vec_to_string, mat4_matmul_many} from "./icg_math.js"

import {init_noise} from "./noise.js"
import {init_terrain} from "./terrain.js"


async function main() {
	/* const in JS means the variable will not be bound to a new value, but the value can be modified (if its an object or array)
		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
	*/

	const debug_overlay = document.getElementById('debug-overlay')

	// We are using the REGL library to work with webGL
	// http://regl.party/api
	// https://github.com/regl-project/regl/blob/master/API.md

	const regl = createREGL({ // the canvas to use
		profile: true, // if we want to measure the size of buffers/textures in memory
		extensions: ['oes_texture_float'], // enable float textures
	})

	// The <canvas> (HTML element for drawing graphics) was created by REGL, lets take a handle to it.
	const canvas_elem = document.getElementsByTagName('canvas')[0]


	let update_needed = true

	{
		// Resize canvas to fit the window, but keep it square.
		function resize_canvas() {
			canvas_elem.width = window.innerWidth
			canvas_elem.height = window.innerHeight

			update_needed = true
		}
		resize_canvas()
		window.addEventListener('resize', resize_canvas)
	}

	/*---------------------------------------------------------------
		Resource loading
	---------------------------------------------------------------*/

	/*
	The textures fail to load when the site is opened from local file (file://) due to "cross-origin".
	Solutions:
	* run a local webserver
		caddy file-server -browse -listen 0.0.0.0:8000 -root .
		# or
		python -m http.server 8000
		# open localhost:8000
	OR
	* run chromium with CLI flag
		"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files index.html

	* edit config in firefox
		security.fileuri.strict_origin_policy = false
	*/

	// Start downloads in parallel
	const resources = {};

	[
		"noise.frag.glsl",
		"display.vert.glsl",

		"terrain.vert.glsl",
		"terrain.frag.glsl",

		"buffer_to_screen.vert.glsl",
		"buffer_to_screen.frag.glsl",

	].forEach((shader_filename) => {
		resources[`shaders/${shader_filename}`] = load_text(`./src/shaders/${shader_filename}`)
	});

	// Wait for all downloads to complete
	for (const key of Object.keys(resources)) {
		resources[key] = await resources[key]
	}


	/*---------------------------------------------------------------
		Camera
	---------------------------------------------------------------*/
	const mat_turntable = mat4.create()
	const cam_distance_base = 0.75

	let cam_angle_z = -0.5 // in radians!
	let cam_angle_y = -0.42 // in radians!
	let cam_distance_factor = 1.

	let cam_target = [0, 0, 0]

	function update_cam_transform() {
		/* #TODO PG1.0 Copy camera controls
		* Copy your solution to Task 2.2 of assignment 5.
		Calculate the world-to-camera transformation matrix.
		The camera orbits the scene
		* cam_distance_base * cam_distance_factor = distance of the camera from the (0, 0, 0) point
		* cam_angle_z - camera ray's angle around the Z axis
		* cam_angle_y - camera ray's angle around the Y axis

		* cam_target - the point we orbit around
		*/
		const translation = mat4.translate(mat4.create(), mat4.create(), [cam_distance_base * cam_distance_factor, 0, 0])
		const rotation_y = mat4.rotateY(mat4.create(), mat4.create(), cam_angle_y)
		const rotation_z = mat4.rotateZ(mat4.create(), mat4.create(), cam_angle_z)

		// Example camera matrix, looking along forward-X, edit this
		const look_at = mat4.lookAt(mat4.create(),
			[-1, 0, 0], // camera position in world coord
			[0, 0, 0], // view target point
			[0, 0, 1], // up vector
		)
		// Store the combined transform in mat_turntable
		// mat_turntable = A * B * ...
		//mat4_matmul_many(mat_turntable, look_at) // edit this
		mat4_matmul_many(mat_turntable,
			look_at,
			translation,
			rotation_y,
			rotation_z,
		)
	}

	update_cam_transform()

	// Prevent clicking and dragging from selecting the GUI text.
	canvas_elem.addEventListener('mousedown', (event) => { event.preventDefault() })

	// Rotate camera position by dragging with the mouse
	window.addEventListener('mousemove', (event) => {
		// if left or middle button is pressed
		if (event.buttons & 1 || event.buttons & 4) {
			if (event.shiftKey) {
				const r = mat2.fromRotation(mat2.create(), -cam_angle_z)
				const offset = vec2.transformMat2([0, 0], [event.movementY, event.movementX], r)
				vec2.scale(offset, offset, -0.01)
				cam_target[0] += offset[0]
				cam_target[1] += offset[1]
			} else {
				cam_angle_z += event.movementX*0.005
				cam_angle_y += -event.movementY*0.005
			}
			update_cam_transform()
			update_needed = true
		}

	})

	window.addEventListener('wheel', (event) => {
		// scroll wheel to zoom in or out
		const factor_mul_base = 1.08
		const factor_mul = (event.deltaY > 0) ? factor_mul_base : 1./factor_mul_base
		cam_distance_factor *= factor_mul
		cam_distance_factor = Math.max(0.1, Math.min(cam_distance_factor, 4))
		// console.log('wheel', event.deltaY, event.deltaMode)
		event.preventDefault() // don't scroll the page too...
		update_cam_transform()
		update_needed = true
	})



	/*---------------------------------------------------------------
		Actors
	---------------------------------------------------------------*/

	const noise_textures = init_noise(regl, resources)

	const texture_fbm = (() => {
		for(const t of noise_textures) {
			//if(t.name === 'FBM') {
			if(t.name === 'FBM_for_terrain') {
				return t
			}
		}
	})()


	const map_width = 20;
	const map_height = 20;
	texture_fbm.draw_texture_to_buffer({width: map_width, height: map_height, mouse_offset: [-12.24, 8.15]})

	var init_terrain_response;
	var terrain_map = null;
	var terrain_actor = null;
	
	function generateTerrain(generator){
		init_terrain_response = init_terrain(regl, resources, texture_fbm.get_buffer())
	 	terrain_actor = init_terrain_response.terrain_actor;
		terrain_map = init_terrain_response.terrain_map; 
	}

	/*---------------------------------------------------------------
		Minimap
	---------------------------------------------------------------*/
	const map = document.getElementById('minimap');
	var isMinimapVisible = true;

	var inEditorMode = false;

	const minimap = document.getElementById('map_visual');

	const editTools = document.getElementById("editTools");
	const validationTools = document.getElementById("validerOrCancel");
	const availableTiles = document.getElementById("availableTiles");

	const edit1 = document.getElementById('edit1');
	const edit2 = document.getElementById('edit2');
	const edit3 = document.getElementById('edit3');
	
	const valider = document.getElementById('valider');
	const cancel = document.getElementById('cancel');

	const zoomIn = document.getElementById('zoomIn');
	const zoomOut = document.getElementById('zoomOut');
	const backToEdit = document.getElementById('back_to_edit');
	const move = document.getElementById('move');



	/* event listener and handler */
	function handleMinimapClick(event){
		let boundingRect = minimap.getBoundingClientRect();
		let xWithinCanvas = event.pageX - boundingRect.left;
		let yWithinCanvas = event.pageY - boundingRect.top;
		alert(`you clicked here : (${xWithinCanvas},${yWithinCanvas})`)
	}
	minimap.addEventListener('click', (event) => {
		handleMinimapClick(event);
	});
	const drawingContext = minimap.getContext("2d");

	function zoomInMap(){
		// alert("zoom in");
	}
	function zoomOutMap(){
		// alert("zoom out");
	}
	zoomIn.addEventListener('click', () => {
		zoomInMap();
	});
	zoomOut.addEventListener('click', () => {
		zoomOutMap();
	});

	function edit(mode){
		inEditorMode = true;
		move.style.display = "inline";
		minimap.style.cursor = "crosshair";
		editTools.style.display = "none";
		validationTools.style.display = "block";
		switch(mode){
			case 1 :
				break;
			case 2 : 
				break;
			case 3:
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
	edit3.addEventListener('click', () => {
		edit(3);
	});

	function regenerate(){
		generateTerrain(null);
		drawMap();
		update_needed=true;
		render();
	}

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
			case '': 
				break;
			case '': 
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
		move.style.display = "none";
		backToEdit.style.display = "none";
		editTools.style.display = "block";
		validationTools.style.display = "none";
		availableTiles.style.display = "none";
		switch(mode){
			case 1 :
				break;
			case 2 :
				break;
		}
	}
	valider.addEventListener('click', () => {
		validerOrCancel(1);
	});
	cancel.addEventListener('click', () => {
		validerOrCancel(2);
	});
	
	
	function moveOrEdit(mode){
		switch(mode){
			case 1 :
				backToEdit.style.display = "inline";
				move.style.display = "none";
				minimap.style.cursor = "grab";
				break;
			case 2 :
				backToEdit.style.display = "none";
				move.style.display = "inline";
				minimap.style.cursor = "crosshair";
				break;
		}
	}
	move.addEventListener('click', () => {
		moveOrEdit(1);
	});
	backToEdit.addEventListener('click', () => {
		moveOrEdit(2);
	});


	/* minimap drawing */
	const map_DIM = 300;
	minimap.width = map_DIM;
	minimap.height = map_DIM;

	const roadColor = "rgb(127, 100, 100)";
	const waterColor = "rgb(79, 202, 227)";
	const grassColor = "rgb(154, 217, 138)";
	const sandColor = "rgb(231, 217, 195)";

	const DIM_CELL = (map_DIM/map_width)/3;

	var currentScale = 1; // x1, x2, x4, x8
	var centeredOn = {x:null, y:null};
		
	function drawMap(){

		// make use of the currentScale and the centeredOn to display 
		// the map properly

		for(let i = 0; i < map_width * 3; i++){
			for(let j = 0; j < map_height * 3; j++){
				var cell = terrain_map[i][j];
				switch(cell){
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
				drawingContext.fillRect((map_width*3-1-i)*DIM_CELL,j*DIM_CELL,DIM_CELL,DIM_CELL);
			}	
		}
	}

	window.addEventListener("resize", event => {
		minimap.width = map_DIM;
		minimap.height = map_DIM;
		drawMap();
	})
	
	
	/*
	for(let i =0; i < map.width; i++){
		for(let j = 0; j < map.height; j++){
			let x = i * DIM_CELL;
			let y = j * DIM_CELL;
			
			drawingContext.startPath();
			drawingContext.fillStyle = "rgb(0, 255, 255)";
			drawingContext.fillRect(x, y, DIM_CELL, DIM_CELL);
			drawingContext.endPath();
		}
	}
	*/


	/*
		UI
	*/
	register_keyboard_action('z', () => {
		debug_overlay.classList.toggle('hide')
	})


	function activate_preset_view() {
		cam_angle_z = 1.3
		cam_angle_y = -0.5
		cam_distance_factor = 1.0
		cam_target = [0, 0, 0]

		update_cam_transform()
		update_needed = true
	}
	activate_preset_view()
	register_button_with_hotkey('btn-preset-view', '1', activate_preset_view)

	/*---------------------------------------------------------------
		Frame render
	---------------------------------------------------------------*/

	function render(){
		const mat_projection = mat4.create()
		const mat_view = mat4.create()

		let light_position_world = [0.2, -0.3, 0.8, 1.0]
		//let light_position_world = [1, -1, 1., 1.0]

		const light_position_cam = [0, 0, 0, 0]

		regl.frame((frame) => {
			if(update_needed) {
				update_needed = false // do this *before* running the drawing code so we don't keep updating if drawing throws an error.

				mat4.perspective(mat_projection,
					deg_to_rad * 60, // fov y
					frame.framebufferWidth / frame.framebufferHeight, // aspect ratio
					0.01, // near
					100, // far
				)

				mat4.copy(mat_view, mat_turntable)

				// Calculate light position in camera frame
				vec4.transformMat4(light_position_cam, light_position_world, mat_view)

				const scene_info = {
					mat_view:        mat_view,
					mat_projection:  mat_projection,
					light_position_cam: light_position_cam,
				}

				// Set the whole image to black
				regl.clear({color: [0.9, 0.9, 1., 1]})

				terrain_actor.draw(scene_info)
			}

			// Set the whole image to black
			regl.clear({color: [0.9, 0.9, 1., 1]})
			const d = new Date();
			let time = d.getTime() / 1000.;	
			let r = Math.sin(time - Math.PI/2.0);
			let g = Math.sin(time - Math.PI/2.0);
			let b = Math.sin(time - Math.PI/2.0);

			//regl.clear({color: [r, g, b, 1]})

	// generate the map 
	generateTerrain(null)
	drawMap()
	render()
	})}
}
DOM_loaded_promise.then(main)

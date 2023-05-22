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

	const init_terrain_response = init_terrain(regl, resources, texture_fbm.get_buffer())
	const terrain_actor = init_terrain_response.terrain_actor;
	const terrain_map = init_terrain_response.terrain_map; 

	/*---------------------------------------------------------------
		Minimap
	---------------------------------------------------------------*/
	const map = document.getElementById('minimap');
	var isMinimapVisible = true;
	document.addEventListener('keypress', (event) => {
		if (event.key === 'm') {
			if(isMinimapVisible){
				map.style.display = "none";
			}else{
				map.style.display = "block";
			}
			isMinimapVisible = !isMinimapVisible;
		}
	});

	const minimap = document.getElementById('map_visual');
	minimap.addEventListener('click', (event) => {
		alert("map editor mode not implemented yet");
	});
	const drawingContext = minimap.getContext("2d");
	
	const map_DIM = 300;
	minimap.width = map_DIM;
	minimap.height = map_DIM;

	const roadColor = "rgb(127, 100, 100)";
	const waterColor = "rgb(79, 202, 227)";
	const grassColor = "rgb(154, 217, 138)";
	const mountainColor = "rgb(231, 217, 195)";

	const DIM_CELL = (map_DIM/map_width)/3;
			
	for(let i = 0; i < map_width * 3; i++){
		for(let j = 0; j < map_height * 3; j++){
			var cell = terrain_map[i][j];
			switch(cell){
				case 0:
					drawingContext.fillStyle = waterColor;
					break;
				case 1:
					drawingContext.fillStyle = mountainColor;
					break;
				case 2:
					drawingContext.fillStyle = grassColor;
					break;
				case 3 :
					drawingContext.fillStyle = "red";
					break;
				default :
					break;
			}
			drawingContext.fillRect((map_width*3-1-i)*DIM_CELL,j*DIM_CELL,DIM_CELL,DIM_CELL);
		}	
	}
	
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
		cam_angle_z = -1.0
		cam_angle_y = -0.42
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
	const mat_projection = mat4.create()
	const mat_view = mat4.create()

	let light_position_world = [0.2, -0.3, 0.8, 1.0]
	//let light_position_world = [1, -1, 1., 1.0]

	const light_position_cam = [0, 0, 0, 0]

	regl.frame((frame) => {
		if(update_needed) {
			update_needed = true // do this *before* running the drawing code so we don't keep updating if drawing throws an error.

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
			const d = new Date();
			let time = d.getTime() / 1000.;	
			let r = Math.sin(time - Math.PI/2.0);
			let g = Math.sin(time - Math.PI/2.0);
			let b = Math.sin(time - Math.PI/2.0);

			//regl.clear({color: [r, g, b, 1]})

			terrain_actor.draw(scene_info)
		}

// 		debug_text.textContent = `
// Hello! Sim time is ${sim_time.toFixed(2)} s
// Camera: angle_z ${(cam_angle_z / deg_to_rad).toFixed(1)}, angle_y ${(cam_angle_y / deg_to_rad).toFixed(1)}, distance ${(cam_distance_factor*cam_distance_base).toFixed(1)}
// `
	})
}

DOM_loaded_promise.then(main)

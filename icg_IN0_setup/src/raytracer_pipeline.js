
import {load_text} from "./icg_web.js"
import {framebuffer_to_image_download} from "./icg_screenshot.js"
// import {SHOW_BUFFER_VERT, SHOW_BUFFER_FRAG} from "./show_buffer.glsl.js"
import * as vec3 from "../lib/gl-matrix_3.3.0/esm/vec3.js"

const SCENES = [{
	/*
	#TODO IN0.2: 
	* Create a new material in `src/raytracer_pipeline.js` named "custom" with the color of your choice, an ambient coefficient of 1, and the remaining coefficients set to 0. 
	* Set the material of the sphere to your custom material.
	* Set the sphere radius to 0.5.
	* Reload the page
	* Save the image (click the button or press `S`)
	*/

	name: "basic-sphere",
	materials: [
		{name: 'green', color: [0.3, 1., 0.4], ambient: 1., diffuse: 0., specular: 0., shininess: 0., mirror: 0.},
	],
	lights: [
		{position: [3., 0, -0.5], color: [1.0, 0.4, 0.2]},
		{position: [-3., -0.8, 3], color: [0.2, 0.4, 0.9]},
	],
	spheres: [
		{center: [0.0, 0.0, 2.0], radius: 1., material: 'green'},
	],
	planes: [],
	cylinders: [],
	mesh: null,
}
]
const SCENES_BY_NAME = Object.fromEntries(SCENES.map((sc) => [sc.name, sc]))

const mesh_quad_2d = {
	position: [
		// 4 vertices with 2 coordinates each
		[-1, -1],
		[1, -1],
		[1, 1],
		[-1, 1],
	],
	faces: [
		[0, 1, 2], // top right
		[0, 2, 3], // bottom left
	],
}

export class Raytracer {
	constructor({resolution}) {
		this.resolution = resolution
	}

	async rt_pipeline_for_scene(scene) {
		const {name, materials, lights, spheres, planes, cylinders, mesh} = scene

		// Shader source, we will inject NUM_SPHERES, ... into it
		let shader_source_frag = await this.resources.tracer_frag

		const uniforms = {
			field_of_view_xy: [Math.PI * 90. / 180., Math.PI * 90. / 180.],

			light_color_ambient: [1.0, 1.0, 1.0],
		}

		// Materials
		const material_id_by_name = {}

		materials.forEach((mat, idx) => {
			material_id_by_name[mat.name] = idx
			uniforms[`materials[${idx}].color`] = mat.color
			uniforms[`materials[${idx}].ambient`] = mat.ambient
			uniforms[`materials[${idx}].diffuse`] = mat.diffuse
			uniforms[`materials[${idx}].specular`] = mat.specular
			uniforms[`materials[${idx}].shininess`] = mat.shininess
			uniforms[`materials[${idx}].mirror`] = mat.mirror
		})
		shader_source_frag = shader_source_frag.replace('inject-num-materials', `${materials.length}`)

		// Lights
		lights.forEach((li, idx) => {
			uniforms[`lights[${idx}].position`] = li.position
			uniforms[`lights[${idx}].color`] = li.color
		})
		shader_source_frag = shader_source_frag.replace('inject-num-lights', `${lights.length}`)

		// 
		const object_material_id = []
		let num_objects = 0;

		function next_object_material(mat_name) {
			object_material_id[num_objects] = material_id_by_name[mat_name]
			uniforms[`object_material_id[${num_objects}]`] = material_id_by_name[mat_name]
			num_objects += 1
		}

		// Spheres
		// Array of sphere geometry in uniforms
		spheres.forEach((sph, idx) => {
			uniforms[`spheres_center_radius[${idx}]`] = sph.center.concat(sph.radius)
			
			next_object_material(sph.material)
		})
		// Fill NUM_SPHERES in shader source
		shader_source_frag = shader_source_frag.replace('inject-num-spheres', `${spheres.length}`)

		const pipeline_tracer = this.regl({
			// Vertex attributes
			attributes: {
				vertex_position: mesh_quad_2d.position,
			},
			elements: mesh_quad_2d.faces,
				
			// Uniforms: global data available to the shader
			uniforms: uniforms,	
				
			depth: { enable: false },
		
			/* 
			Vertex shader program
			Given vertex attributes, it calculates the position of the vertex on screen
			and intermediate data ("varying") passed on to the fragment shader
			*/
			vert: await this.resources.tracer_vert,
				
			/* 
			Fragment shader program
			Calculates the color of each pixel covered by the mesh.
			The "varying" values are interpolated between the values given by the vertex shader on the vertices of the current triangle.
			*/
			frag: shader_source_frag,

			framebuffer: this.result_framebuffer,
			//viewport: {x:0, y:0, width: result_wh[0], height: result_wh[1]},
		})

		return pipeline_tracer
	}

	async init(regl) {
		this.regl = regl

		this.resources = {
			tracer_frag: load_text('./src/tracer.frag.glsl'),
			tracer_vert: load_text('./src/tracer.vert.glsl'),
			show_frag: load_text('./src/show_buffer.frag.glsl'),
			show_vert: load_text('./src/show_buffer.vert.glsl'),
		}

		this.result_buffer = regl.texture({
			width: this.resolution[0],
			height: this.resolution[1],
			format: 'rgba',
			min: 'linear',
			mag: 'linear',
		})
		
		this.result_framebuffer = regl.framebuffer({
			color: [this.result_buffer],
			depth: false, stencil: false,
		})

		this.pipeline_show = regl({
			attributes: {
				vertex_position: mesh_quad_2d.position,
			},
			elements: mesh_quad_2d.faces,
			uniforms: {
				tex: this.result_buffer,
			},
			depth: { enable: false },
			vert: await this.resources.show_vert,
			frag: await this.resources.show_frag,
		})
	}

	async draw_scene(scene_name) {
		const scene_def = SCENES_BY_NAME[scene_name]

		if(! scene_def) {
			console.error(`No scene ${scene_name}`)
			return 
		}

		const pipe = await this.rt_pipeline_for_scene(scene_def)
		this.scene_name = scene_name

		pipe()
		//console.log(`Rt scene ${scene_name}`, pipe.stats)

		pipe.destroy()
	}

	save_image() {
		framebuffer_to_image_download(this.regl, this.result_framebuffer, `${this.scene_name}.png`)
	}
}


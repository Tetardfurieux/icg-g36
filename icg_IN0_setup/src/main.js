
import {createREGL} from "../lib/regljs_2.1.0/regl.module.js"
import {setMatrixArrayType} from "../lib/gl-matrix_3.3.0/esm/common.js"
import {DOM_loaded_promise, register_button_with_hotkey} from "./icg_web.js"

import {Raytracer} from "./raytracer_pipeline.js"

setMatrixArrayType(Array);

function init_dom_elems(elem_canvas, on_resize_func) {
	// Resize canvas to fit the window, but keep it square.
	function resize_canvas() {
		const s = Math.min(window.innerHeight, window.innerWidth) - 10
		elem_canvas.width = s
		elem_canvas.height = s
		//elem_canvas.width = window.innerWidth
		//elem_canvas.height = window.innerHeight
	}
	window.addEventListener('resize', () => {
		resize_canvas()
		if(on_resize_func) {
			on_resize_func()
		}
	})
	resize_canvas()
}

async function main() {
	const elem_canvas = document.getElementById('viewport')
	const debug_text = document.getElementById('debug-text')

	const regl = createREGL({
		canvas: elem_canvas,
		profile: true, // if we want to measure the size of buffers/textures in memory
		extensions: [
		], 
	})
	console.log('MAX_VERTEX_UNIFORM_VECTORS', regl._gl.MAX_VERTEX_UNIFORM_VECTORS)

	// Run ray-tracing
	const rt = new Raytracer({
		resolution: [640, 640],
	})
	
	await rt.init(regl)
	await rt.draw_scene('basic-sphere')

	// Show output buffer
	function regenerate_view() {
		regl.poll()
		rt.pipeline_show()
	}
	init_dom_elems(elem_canvas, () => requestAnimationFrame(regenerate_view))
	regenerate_view()

	// Saving the image
	register_button_with_hotkey('btn-screenshot', 's', () => {
		// put breakpoint here then press S
		rt.save_image()
	})
}

async function entrypoint() {
	await DOM_loaded_promise
	await main()
}

entrypoint()

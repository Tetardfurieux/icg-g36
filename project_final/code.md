# Code 

## WFC

## Mini Map

## Interactivity

## Day/Night cycle

### terrain.js
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

### main_terrain.js

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

### terrain.frag.glsl
    	vec3 light_color = times * vec3(1.0, 0.941, 0.898);
    
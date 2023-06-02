# Abstract

Our project is an interactive terrain generation tool made in the WebGL engine developed in class. It is based on the Wave Function Collapse algorithm and allows the user to interactively decide to keep or delete any part of the generated terrain and regenerate a new terrain matching those constraints.

# Technical approach

## Wave Function Collapse

Our implementation of the Wave Function Collapse algorithm is written in JavaScript.
It is inspired by the pseudo-code described in the repository of the original implementation of the algorithm at https://github.com/mxgmn/WaveFunctionCollapse.

```
1. Read the input bitmap and count NxN patterns. 
    i. (optional) Augment pattern data with rotations and reflections.
2. Create an array with the dimensions of the output (called "wave" in the source). Each element of this array represents a state of an NxN region in the output. A state of an NxN region is a superposition of NxN patterns of the input with boolean coefficients (so a state of a pixel in the output is a superposition of input colors with real coefficients). False coefficient means that the corresponding pattern is forbidden, true coefficient means that the corresponding pattern is not yet forbidden.
3. Initialize the wave in the completely unobserved state, i.e. with all the boolean coefficients being true.
4. Repeat the following steps:
    i. Observation:
        a. Find a wave element with the minimal nonzero entropy. If there is no such elements (if all elements have zero or undefined entropy) then break the cycle (4) and go to step (5).
        b. Collapse this element into a definite state according to its coefficients and the distribution of NxN patterns in the input.
    ii. Propagation: propagate information gained on the previous observation step.
5. By now all the wave elements are either in a completely observed state (all the coefficients except one being zero) or in the contradictory state (all the coefficients being zero). In the first case return the output. In the second case finish the work without returning anything.
```

In our implementation, we chose to create a set of 3x3 tiles which we handcrafted to get the best looking results possible.
We decided to implement the most complex variant of the algorithm using adjacency probabilities instead of simply collapsing the tiles at random from the remaining accepted ones.
This allowed us to create bigger islands and bigger sea areas instead of a lot of tiny islands which made for a much less interesting terrain.

To transfer the computed terrain to the shaders, we use GLSL uniforms. Due to a limitation in the GLSL version used in the course engine, we had to optimize each element of the Uniform array to hold 4 integers instead of 1 by setting each consecutive block of 4 elements [a, b, c, d] to fit in one element as $a \cdot 10^3 + b \cdot 10^2 + c \cdot 10 + d$ which allowed us to get a much bigger terrain which we decided to set to 60x60 to make the interactive mini-map easier to use.

## Shaders
Within the shaders, we access the Uniform array and dynamically assign color and height values based on the type of each tile.

## Interactivity
Our project includes a mini map that provides a 2d overview of the generated terrain. The map comes together with 2 edit tools in order to enable users to modify and interact with the map. The edit tool 1, enables to keep tiles of the map that are interesting and after selection validation regenerates based on the selected tiles. The edit tool 2, enable to erase tiles and tries to replace them with new tiles.

## Day/Night cycle

To implement the day/night cycle, we utilized a sine function applied to the current timestamp. This function provided us with a value ranging from 0 to 1. Subsequently, we utilized this value to determine the background color and adjust the lighting color accordingly.

# Contributions

## Workload splitting

    Antoine Roger (312065): 1/3
    Baptiste Copros (312639): 1/3
    Benoit Morawiec (312622): 1/3

## Workload details

    Antoine Roger (312065): Wave Function Collapse, Shaders
    Baptiste Copros (312639): Day/Night cycle, Shaders, Terrain generation
    Benoit Morawiec (312622): Interactivity, Mini Map

# References
https://github.com/mxgmn/WaveFunctionCollapse.

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
    
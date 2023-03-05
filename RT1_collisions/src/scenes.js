
const SCENES = [
{
	name: "primitives",
	camera: {
		position: [0, 0, 0], target: [0, 0, 1], up: [0, 1, 0], fov: 75,
	},
	materials: [
		{name: 'green', color: [0.3, 1., 0.4], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.},
		{name: 'black', color: [0.3, 0.3, 0.3], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 1., mirror: 0.},
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.6, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
		{name: 'mirror', color: [0.9, 0.9, 0.9], ambient: 0., diffuse: 0., specular: 0., shininess: 0., mirror: 1.},
	],
	lights: [
		{position: [3., 0, -0.5], color: [1.0, 0.4, 0.2]},
		{position: [-3., -0.8, 3], color: [0.2, 0.4, 0.9]},
	],
	spheres: [
		{center: [0.0, 1.5, 4.0], radius: 1.0, material: 'mirror'},
	],
	planes: [
		{center: [0.0, -1., 0.], normal: [0., 1., 0.], material: 'white'}, // bottom
		{center: [-2, -1., 0.], normal: [0.3939193 , 0.91914503, 0.], material: 'green'}, // left
		{center: [2, -1., 0.], normal: [0.3939193 , -0.91914503, 0.], material: 'green'}, // right
		{center: [0.0, 0., 50.], normal: [0., 0, -1], material: 'green'}, // front
	],
	cylinders: [
		{center: [0.0, -0.8, 4.0], radius: 1, height: 0.4, axis: [0., 1., 0.], material: 'green'},
	],
},
{
	name: "creature", 
	camera: {position: [6.301, 9.207, 4.061], up: [-0.167, -0.209, 0.964], target: [0.291, 1.674, 1.389], fov: 45},
		
	materials: [
		{name: "default", color: [0.6, 0.6, 0.6], ambient: 0.2, diffuse: 0.8, specular: 0.4, shininess: 2.0, mirror: 0.02},
		{name: "grass", color: [0.1, 0.7, 0.01], ambient: 0.2, diffuse: 0.9, specular: 0.3, shininess: 2.0, mirror: 0.02},
		{name: "fuzzy", color: [0.3, 0.4, 0.6], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 2.0, mirror: 0.02},
		{name: "white_shiny", color: [0.9, 0.9, 0.9], ambient: 0.2, diffuse: 0.9, specular: 0.8, shininess: 8.0, mirror: 0.3},
		{name: "black", color: [0.1, 0.1, 0.1], ambient: 0.1, diffuse: 0.5, specular: 0.8, shininess: 1.0, mirror: 0.5},
	], 
	lights: [
		{position: [9.328, 6.822, 2.304], color: [1.0, 0.8, 0.7]},
		{position: [-3.177, 12.593, 5.118], color: [1.0, 0.8, 0.7]},
	], 
	spheres: [
		{center: [0.0, 0.991, 0.0], radius: 1.0, material: "fuzzy"},
		{center: [0.0, -2.351, 0.0], radius: 1.0, material: "fuzzy"},
		{center: [0.0, 2.461, 2.368], radius: 1.112, material: "fuzzy"},
		{center: [-0.443, 3.42, 2.752], radius: 0.253, material: "white_shiny"},
		{center: [-0.331, 3.586, 2.795], radius: 0.084, material: "black"},
		{center: [0.583, 3.614, 2.785], radius: 0.084, material: "black"},
		{center: [0.474, 3.458, 2.756], radius: 0.253, material: "white_shiny"},
		{center: [0.0, -3.439, 0.64], radius: 0.46, material: "fuzzy"},
	], 
	planes: [
		{center: [-5.624, 0.917, 8.321], normal: [0.999, 0.0, 0.043], material: "default"},
	], 
	cylinders: [
		{center: [0.0, -0.726, 0.0], axis: [0.0, -1.0, -0.0], height: 3.463, radius: 1.0, material: "fuzzy"},
		{center: [0.0, 1.754, 1.159], axis: [0.0, -0.538, -0.843], height: 1.418, radius: 0.409, material: "fuzzy"},
		{center: [0.667, 1.957, 3.476], axis: [-0.241, 0.551, -0.799], height: 0.791, radius: 0.228, material: "default"},
		{center: [-0.674, 1.934, 3.473], axis: [-0.241, -0.551, 0.799], height: 0.791, radius: 0.228, material: "default"},
		{center: [0.762, -2.491, -1.279], axis: [0.172, -0.087, -0.981], height: 1.53, radius: 0.193, material: "default"},
		{center: [-0.708, -2.49, -1.266], axis: [0.172, 0.087, 0.981], height: 1.53, radius: 0.193, material: "default"},
		{center: [-0.708, 1.156, -1.266], axis: [0.172, -0.155, 0.973], height: 1.53, radius: 0.193, material: "default"},
		{center: [0.762, 1.158, -1.279], axis: [0.172, 0.155, -0.973], height: 1.53, radius: 0.193, material: "default"},
		{center: [15.761, -0.629, 32.113], axis: [1.0, 0.0, -0.0], height: 68.535, radius: 34.268, material: "grass"}
	]
},
{
	name: "empty",
	camera: {
		position: [0, 0, 0], target: [0, 0, 1], up: [0, 1, 0], fov: 75,
	},
	materials: [
		{name: 'green', color: [0.3, 1., 0.4], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.},
	],
	lights: [
		{position: [0, 0, 0.1], color: [1.0, 0.4, 0.2]},
	],
	spheres: [],
	planes: [],
	cylinders: [],
},
{
	name: "floor",
	camera: {
		position: [-2, 0, 1], target: [0, 0, 0], up: [1, 0, 0.75], fov: 75,
	},
	materials: [
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.6, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
	],
	lights: [],
	spheres: [],
	planes: [
		{center: [0.0, 0., -0.5], normal: [0, 0, 1], material: 'white'}, // floor
	],
	cylinders: [],
},
{
	name: "corner1",
	camera: {
		position: [0, 0.5, 0], target: [0, 0.5, 1], up: [0, 1, 0], fov: 75,
	},
	materials: [
		{name: 'green', color: [0.3, 1., 0.4], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.},
	],
	lights: [
		{position: [0., 0., 0.1], color: [1.0, 0.4, 0.2]},
	],
	spheres: [],
	planes: [
		{center: [0.0, 0., 1.], normal: [0., 0., 1.], material: 'green'},
		{center: [0.0, 0., 0.], normal: [0., 1., 0.], material: 'green'},
		{center: [-0.3, 0., 0.], normal: [1., 0., 0.], material: 'green'},
	],
	cylinders: [],
},
{
	name: "corner2",
	camera: {
		position: [-0.43, -0.35, 0.415], target: [0, -0.55, 0.], up: [0, 1, 0], fov: 70,
	},
	materials: [
		{name: 'wall', color: [0.655, 0.831, 0.608], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.},
		{name: 'mesh', color: [0.714, 0.427, 0.051], ambient: 0.6, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
	],
	lights: [
		{position: [0., -0.45, 1.5], color: [0.5, 0.5, 0.5]},  // I
		{position: [-1.5, -0.4, 0.], color: [0.5, 0.5, 0.5]},  // C
		{position: [-0.1, 1., 0.], color: [0.5, 0.5, 0.5]},      // G
	],
	spheres: [],
	planes: [
		{center: [0., 0., -0.4], normal: [0., 0., 1.], material: 'wall'}, // I
		{center: [0.35, 0., 0.], normal: [1., 0., 0.], material: 'wall'}, // C
		{center: [0., -0.8, 0.], normal: [0., 1., 0.], material: 'wall'}, // G
	],
	cylinders: [],
},
{
	name: "barrel",
	camera: {
		position: [0, 0, 0], target: [0, 0, 1], up: [0, 1, 0], fov: 75,
	},
	materials: [
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.6, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
	],
	lights: [
		{position: [0., 0., -0.2], color: [1.0, 0.4, 0.2]},
	],
	spheres: [
		{center: [0, 0, 7], radius: 1, material: 'white'},
	],
	planes: [],
	cylinders: [
		{center: [0.0, 0.0, 0.0], radius: 0.1, height: 0.5, axis: [0., 0., 1.], material: 'white'},
	],
},
{
	name: "cylinders",
	camera: {
		position: [0, 3, 8], target: [0, 1, 0], up: [0, 1, 0], fov: 45,
	},
	materials: [
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.6, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
	],
	lights: [
		{position: [20, 50, 0], color: [1.0, 0.4, 0.2]},
		{position: [50, 50, 50], color: [0.2, 0.4, 0.9]},
		{position: [-50, 50, 50], color: [0.2, 0.8, 0.2]},
	],
	spheres: [],
	planes: [],
	cylinders: [
		{center: [-1.5, 1.0, 0.0], radius: 0.5, height: 1.5, axis: [-1, 1, 1], material: 'white'},
		{center: [ 0.0, 1.0, 0.0], radius: 0.5, height: 1.5, axis: [0, 1, 1], material: 'white'},
		{center: [ 1.5, 1.0, 0.0], radius: 0.5, height: 1.5, axis: [1, 1, 1], material: 'white'},
	],
}
]

SCENES.push({
	name: 'columns',
	camera: {
		position: [0, -8, 6], target: [0, 0, 0], up: [0, 0, 1], fov: 70,
	},
	lights: [
		{position: [0, 1, 2], color: [0.0, 0.7, 0.9]},
		{position: [20, -3, 0], color: [1, 0.2, 0.1]},
	],
	materials: [
		{name: 'floor', color: [0.9, 0.9, 0.9], ambient: 0.1, diffuse: 0.5, specular: 0.4, shininess: 4., mirror: 0.4},
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.1, diffuse: 0.9, specular: 0.1, shininess: 2., mirror: 0.0},
		{name: 'shiny', color: [0.9, 0.3, 0.1], ambient: 0.1, diffuse: 0.3, specular: 0.9, shininess: 10., mirror: 0.2},
	],
	spheres: [
	],
	cylinders: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { 
		const a = i * Math.PI * 2 / 8 + 0.123
		const r = 3
		return { center: [r*Math.cos(a), r*Math.sin(a), 0], axis: [0, 0, 1], radius: 0.25, height: 4, material: 'shiny' }
	}),
	planes: [
		{center: [0, 0, -1], normal: [0, 0, 1], material: 'floor'},
	],
})

SCENES.push({
	name: 'desk1',
	camera: {
		position: [0., 0., -1.], target: [0., 0, 0.], up: [0, 1, 0], fov: 65,
	},
	materials: [
		{name: 'wall', color: [0.9, 0.9, 0.9], ambient: 0.1, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.},
		{name: 'table', color: [0.49, 0.49, 0.38], ambient: 0.1, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.03},
		{name: 'pot', color: [0.76, 0.76, 0.68], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
		{name: 'pen', color: [1., 0.65, 0.17], ambient: 0.1, diffuse: 0.9, specular: 1.0, shininess: 8., mirror: 0.03},
		{name: 'rubber', color: [0.60, 0.30, 0.24], ambient: 0.2, diffuse: 0.5, specular: 0., shininess: 4., mirror: 0.1},
		{name: 'metal', color: [0.85, 0.85, 0.85], ambient: 0.2, diffuse: 0.5, specular: 1.0, shininess: 4., mirror: 0.3},
	],
	lights: [
		{position: [0.3, 0.35, -0.15], color: [0.9, 0.8, 0.7]},
	],
	spheres: [
		{center: [-0.588, 0.096, 0.324], radius: 0.01, material: 'rubber'},
	],
	planes: [
		{center: [0., 0., 1.5], normal: [0., 0., 1.], material: 'wall'},
		{center: [0., -0.4, 0.], normal: [0., 1., 0.], material: 'table'},
	],
	cylinders: [
		{center: [-0.2, -0.25, 0.1], radius: 0.2, height: 0.3, axis: [0., 1., 0.], material: 'pot'},
		{center: [-0.304, -0.15, 0.16], radius: 0.01, height: 0.7, axis: [-0.693, 0.6, 0.4], material: 'pen'},
		{center: [-0.564, 0.075, 0.31], radius: 0.011, height: 0.05, axis: [-0.693, 0.6, 0.4], material: 'metal'},
		{center: [ 0.42, 0.425, -0.165], radius: 0.2, height: 0.5, axis: [0.8, 0.5, -0.1], material: 'metal'},
	],
})

SCENES.push({
	name: 'mirror1',
	camera: {
		position: [0.5, -2, 0.4], target: [0.5, 0, 0.4], up: [0, 0, 1], fov: 65,
	},
	materials: [
		{name: 'floor', color: [0.9, 0.9, 0.9], ambient: 0.1, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.2},
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
		{name: 'mirror', color: [0.9, 0.9, 0.9], ambient: 0., diffuse: 0., specular: 1.0, shininess: 8., mirror: 0.9},
		{name: 'particleR', color: [0.9, 0.3, 0.1], ambient: 0.2, diffuse: 0.5, specular: 0.9, shininess: 10., mirror: 0.1},
		{name: 'particleB', color: [0.1, 0.3, 0.9], ambient: 0.2, diffuse: 0.5, specular: 0.9, shininess: 10., mirror: 0.1},

	],
	lights: [
		{position: [2.5, 2.5, 4], color: [1.0, 0.8, 0.5]},
		{position: [0.5, -2.5, -0.1], color: [0.5, 0.8, 1.0]},
	],
	spheres: [
		{center: [2, 2, 0.1], radius: 0.5, material: 'particleR'},
		{center: [2, 4, 0.1], radius: 0.5, material: 'particleB'},
		{center: [2, 4, 2.1], radius: 0.5, material: 'particleR'},
	],
	planes: [
		{center: [0, 0, -1], normal: [0, 0, 1], material: 'floor'},
	],
	cylinders: [
		{center: [-2, 4, 0.0], radius: 2, height: 4, axis: [0, 0, 1], material: 'mirror'},
		{center: [2, 3, 0.1], radius: 0.1, height: 2, axis: [0, 1, 0], material: 'white'},
		{center: [2, 4, 1.1], radius: 0.1, height: 2, axis: [0, 0, 1], material: 'white'},
	],
})

	
SCENES.push({
	name: 'mirror2',
	camera: {
		position: [0.5, -2, 0.4], target: [0.5, 0, 0.4], up: [0, 0, 1], fov: 65,
	},
	materials: [
		{name: 'floor', color: [0.9, 0.9, 0.9], ambient: 0.1, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.2},
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
		{name: 'mirror', color: [0.9, 0.9, 0.9], ambient: 0., diffuse: 0., specular: 1.0, shininess: 8., mirror: 0.9},
		{name: 'particleR', color: [0.9, 0.3, 0.1], ambient: 0.2, diffuse: 0.5, specular: 0.9, shininess: 10., mirror: 0.1},
		{name: 'particleB', color: [0.1, 0.3, 0.9], ambient: 0.2, diffuse: 0.5, specular: 0.9, shininess: 10., mirror: 0.1},
	],
	lights: [
		{position: [2.5, 2.5, 4], color: [1.0, 0.8, 0.5]},
		{position: [0.5, -2.5, -0.1], color: [0.5, 0.8, 1.0]},
	],
	spheres: [
		{center: [2, 2, 0.1], radius: 0.5, material: 'particleR'},
		{center: [2, 4, 0.1], radius: 0.5, material: 'particleB'},
		{center: [2, 4, 2.1], radius: 0.5, material: 'particleR'},
	],
	planes: [
		{center: [0, 0, -1], normal: [0, 0, 1], material: 'floor'},
		{center: [-5, 5, 0], normal: [-2, 1, 0], material: 'mirror'},
		{center: [ 5, 5, 0], normal: [2, 1, 0], material: 'mirror'},

	],
	cylinders: [
		{center: [2, 3, 0.1], radius: 0.1, height: 2, axis: [0, 1, 0], material: 'white'},
		{center: [2, 4, 1.1], radius: 0.1, height: 2, axis: [0, 0, 1], material: 'white'},
	],
})
	

export async function load_scenes() {

	const SCENES_BY_NAME = Object.fromEntries(SCENES.map((sc) => [sc.name, sc]))

	return {
		SCENES,
		SCENES_BY_NAME,
	}
}

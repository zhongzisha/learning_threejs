import * as THREE from 'three';


// Create the scene and a camera to view it
var scene = new THREE.Scene();

/**
 * Camera
 **/

// Specify the portion of the scene visiable at any time (in degrees)
var fieldOfView = 75;

// Specify the camera's aspect ratio
var aspectRatio = window.innerWidth / window.innerHeight;

/*
Specify the near and far clipping planes. Only objects
between those planes will be rendered in the scene
(these values help control the number of items rendered
at any given time)
*/
var nearPlane = 100;
var farPlane = 50000;

// Use the values specified above to create a camera
var camera = new THREE.PerspectiveCamera(
    fieldOfView, aspectRatio, nearPlane, farPlane
);

// Finally, set the camera's position
camera.position.z = 5500;
camera.position.y = -100;

/**
 * Renderer
 **/

// Create the canvas with a renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });

// Add support for retina displays
renderer.setPixelRatio( window.devicePixelRatio );

// Specify the size of the canvas
renderer.setSize( window.innerWidth, window.innerHeight );

// Add the canvas to the DOM
document.body.appendChild( renderer.domElement );

/**
 * Load External Data
 **/

// Create a store for image position information
var imagePositions = null;

// Create a store for each of the 5 image atlas files
// The keys will represent the index position of the atlas file,
// and the values will contain the material itself
var materials = {};

// Load the image position JSON file
var loader = new THREE.FileLoader();
loader.load('https://s3.amazonaws.com/duhaime/blog/tsne-webgl/data/image_tsne_projections.json', function(data) {
    imagePositions = JSON.parse(data);
    conditionallyBuildGeometries()
})

/**
 * Load Atlas Textures
 **/

// Create a texture loader so we can load our image file
var loader = new THREE.TextureLoader();
for (var i=0; i<5; i++) {
    var url = 'https://s3.amazonaws.com/duhaime/blog/tsne-webgl/data/';
    url += 'atlas_files/32px/atlas-' + i + '.jpg';
    // Pass the texture index position to the callback function
    loader.load(url, handleTexture.bind(null, i));
}

// Callback function that adds the texture to the list of textures
// and calls the geometry builder if all textures have loaded
function handleTexture(idx, texture) {
    materials[idx] = new THREE.MeshBasicMaterial({map: texture});
    conditionallyBuildGeometries()
}

// If the textures and the mapping from image idx to positional information
// are all loaded, create the geometries
function conditionallyBuildGeometries() {
    if (Object.keys(materials).length === 5 && imagePositions) {
        document.querySelector('#loading').style.display = 'none';
        buildGeometry();
    }
}

/**
 * Build Image Geometry
 **/

// Identify the subimage size in px
var image = {width: 32, height: 32};

// Identify the total number of cols & rows in the image atlas
var atlas = {width: 2048, height: 2048, cols: 64, rows: 64};

// Iterate over the 20 textures, and for each, add a new mesh to the scene
function buildGeometry() {
    for (var i=0; i<5; i++) {
        // Create one new geometry per atlas
        var geometry = new THREE.BufferGeometry();
        var vertices = [];
        var faces = [];
        var faceVertexUvs = [];
        for (var j=0; j<atlas.cols*atlas.rows; j++) {
            // Retrieve the x, y, z coords for this subimage
            var coords = getCoords(i, j);
            //geometry = updateVertices(geometry, coords)
            vertices.push(
                new THREE.Vector3(coords.x, coords.y, coords.z),
                new THREE.Vector3(coords.x + image.width, coords.y, coords.z),
                new THREE.Vector3(coords.x + image.width,coords.y + image.height, coords.z),
                new THREE.Vector3(coords.x, coords.y + image.height, coords.z)
            );
            //geometry = updateFaces(geometry)
            // Add the first face (the lower-right triangle)
            // var faceOne = new THREE.Face3(
            //     vertices.length-4,
            //     vertices.length-3,
            //     vertices.length-2
            // )
            // Add the second face (the upper-left triangle)
            // var faceTwo = new THREE.Face3(
            //     vertices.length-4,
            //     vertices.length-2,
            //     vertices.length-1
            // )
            // Add those faces to the geometry
            // faces.push(faceOne, faceTwo);
            //geometry = updateFaceVertexUvs(geometry, j)

            // var xOffset = (j % atlas.cols) * (image.width / atlas.width);
            // var yOffset = 1 - (Math.floor(j/atlas.cols) * (image.height / atlas.height)) - (image.height / atlas.height);
            // faceVertexUvs.push([
            //     new THREE.Vector2(xOffset, yOffset),
            //     new THREE.Vector2(xOffset + (image.width/atlas.width), yOffset),
            //     new THREE.Vector2(xOffset + (image.width/atlas.width), yOffset + (image.height/atlas.height))
            // ]);
            // faceVertexUvs.push([
            //     new THREE.Vector2(xOffset, yOffset),
            //     new THREE.Vector2(xOffset + (image.width/atlas.width), yOffset + (image.height/atlas.height)),
            //     new THREE.Vector2(xOffset, yOffset + (image.height/atlas.height))
            // ]);
        }
        geometry.setFromPoints(vertices);

        buildMesh(geometry, materials[i])
    }
}

// Get the x, y, z coords for the subimage at index position j
// of atlas in index position i
function getCoords(i, j) {
    var idx = (i * atlas.rows * atlas.cols) + j;
    var coords = imagePositions[idx];
    coords.x *= 1200;
    coords.y *= 600;
    coords.z = (-200 + j/100);
    return coords;
}

function buildMesh(geometry, material) {
    // Convert the geometry to a BuferGeometry for additional performance
    //var geometry = new THREE.BufferGeometry().fromGeometry(geometry);
    // Combine the image geometry and material into a mesh
    var mesh = new THREE.Mesh(geometry, material);
    // Set the position of the image mesh in the x,y,z dimensions
    mesh.position.set(0,0,0)
    // Add the image to the scene
    scene.add(mesh);
}

/**
 * Lights
 **/

// Add a point light with #fff color, .7 intensity, and 0 distance
// var light = new THREE.PointLight( 0xffffff, 1, 0 );

// Specify the light's position
// light.position.set(1, 1, 100);

// Add the light to the scene
// scene.add(light)
//
// /**
//  * Add Controls
//  **/
//
// var controls = new THREE.TrackballControls(camera, renderer.domElement);
//
/**
 * Handle window resizes
 **/

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    //controls.handleResize();
});

/**
 * Render!
 **/

// The main animation function that re-renders the scene each animation frame
function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    //controls.update();
}
animate();
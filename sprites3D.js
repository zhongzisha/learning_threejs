import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';



// create a scene, that will hold all our elements such as objects, cameras and lights.
var scene = new THREE.Scene();

// create a camera, which defines where we're looking at.
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

// create a render and set the size
var webGLRenderer = new THREE.WebGLRenderer();
webGLRenderer.setClearColor(new THREE.Color(0x000000, 1.0));
webGLRenderer.setSize(window.innerWidth, window.innerHeight);

// position and point the camera to the center of the scene
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 400;

// add the output of the renderer to the html element
document.getElementById('WebGL-output').append(webGLRenderer.domElement);


createSprites();
render();

var group;

function createSprites() {

    group = new THREE.Object3D();
    var range = 200;
    for (var i = 0; i < 400; i++) {
        group.add(createSprite(10, false, 0.6, 0xffffff, i % 5, range));
    }
    scene.add(group);
}


function createSprite(size, transparent, opacity, color, spriteNumber, range) {
    var texture = new THREE.TextureLoader().load("sprite-sheet.png");
    texture.offset = new THREE.Vector2(1 / 5 * spriteNumber, 0);
    texture.scale = new THREE.Vector2(1/5, 1);
    var spriteMaterial = new THREE.SpriteMaterial({
        opacity: opacity,
        color: color,
        transparent: transparent,
        sizeAttenuation: true,
        map: texture}
    );

    // we have one row, with five sprites
    spriteMaterial.blending = THREE.AdditiveBlending;

    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size, size, size);
    sprite.position.x = Math.random() * range - range / 2;
    sprite.position.y = Math.random() * range - range / 2;
    sprite.position.z = Math.random() * range - range / 2;
   // sprite.velocityX = 1;

    return sprite;
}


var step = 0;

function render() {

    step += 0.001;
    group.rotation.x = step;

    requestAnimationFrame(render);
    webGLRenderer.render(scene, camera);
}
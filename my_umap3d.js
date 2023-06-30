import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

const tilesHoriz = 18;
const tilesVert = 18;

var group = new THREE.Object3D();
// var range = 200;
// for (var i = 0; i < 400; i++) {
//     group.add(createSprite(10, false, 0.6, 0xffffff, i % 5, range));
// }
// scene.add(group);

const loader = new THREE.FileLoader();
//load a text file and output the result to the console
loader.load(
    // resource URL
    'umap3dforvis.txt',

    // onLoad callback
    function (data) {
        // output the text to the console
        let allTextLines = data.split(/\r\n|\n/);
        console.log(allTextLines[0]);
        console.log(allTextLines.length);
        for (let line_index = 0; line_index < allTextLines.length - 1; ++line_index) {
            let i = Math.floor(line_index / tilesVert);//repeaty
            let j = line_index % tilesVert;
            let line = allTextLines[line_index];
            //console.log(line);
            const splits = line.split(',');
            let x = parseFloat(splits[0] * 5);
            let y = parseFloat(splits[1] * 5);
            let z = parseFloat(splits[2] * 5);
            group.add(createSprite(1, false, 0.9, 0xffffff, i, j, x, y, z));
        }
        // for (let i = 0; i<tilesHoriz; ++i) {
        //     for (let j = 0; j<tilesVert; ++j) {
        //         let line = allTextLines[line_index];
        //         //console.log(line);
        //         const splits = line.split(',');
        //         let x = parseFloat(splits[0]*5);
        //         let y = parseFloat(splits[1]*5);
        //         let z = parseFloat(splits[2]*5);
        //         group.add(createSprite(1, false, 0.9, 0xffffff, i,j,x,y,z));
        //         line_index++;
        //         if (line_index === allTextLines.length-1) {
        //             break;
        //         }
        //         //console.log(line_index);
        //     }
        // }
        scene.add(group);
    },

    // onProgress callback
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },

    // onError callback
    function (err) {
        console.error('An error happened');
    }
);

camera.position.set(0, 0, 50);
controls.update();

let selectedObject = null;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
// document.addEventListener( 'pointermove', onPointerMove );
document.addEventListener('click', onPointerClicked);
window.addEventListener('resize', onWindowResize);


function createSprite(size, transparent, opacity, color, i, j, x, y, z) {
    // texture.magFilter = THREE.NearestFilter;
    var texture = new THREE.TextureLoader().load("sprite.jpg");
    texture.repeat.set(1 / tilesVert, 1 / tilesHoriz);
    texture.offset.x = j / tilesVert;
    texture.offset.y = 1 - i / tilesHoriz;
    var spriteMaterial = new THREE.SpriteMaterial({
            opacity: opacity,
            color: color,
            transparent: transparent,
            sizeAttenuation: true,
            map: texture
        }
    );

    // we have one row, with five sprites
    spriteMaterial.blending = THREE.AdditiveBlending;

    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size, size, size);
    sprite.position.x = x;
    sprite.position.y = y;
    sprite.position.z = z;
    sprite.name = `${i}_${j}`;
    return sprite;
}


function onPointerClicked(event) {
    if (event.type !== 'click') {
        return;
    }

    if (selectedObject) {
        selectedObject = null;
    }

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(group, true);
    if (intersects.length > 0) {
        const res = intersects.filter(function (res) {
            return res && res.object;
        })[0];
        if (res && res.object) {
            selectedObject = res.object;
            console.log(selectedObject.name);
        } else {
            console.log('res is null');
        }
    } else {
        console.log('no intersects');
    }
}

function onPointerMove(event) {
    if (selectedObject) {
        // selectedObject.material.color.set( '#69f' );
        selectedObject = null;
    }

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(group, true);
    if (intersects.length > 0) {
        const res = intersects.filter(function (res) {
            return res && res.object;
        })[0];
        if (res && res.object) {
            selectedObject = res.object;
            // selectedObject.material.color.set( '#f00' );
        }
    }
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    controls.update();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

if (WebGL.isWebGLAvailable()) {
    // Initiate function or other initializations here
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';






const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const controls = new OrbitControls( camera, renderer.domElement );

const tilesHoriz = 5;
const tilesVert = 1;

var group = new THREE.Object3D();
var range = 200;
for (var i = 0; i < 400; i++) {
    group.add(createSprite(10, false, 0.6, 0xffffff, i % 5, range));
}
scene.add(group);

camera.position.set(0, 0, 400);
controls.update();

let selectedObject = null;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
// document.addEventListener( 'pointermove', onPointerMove );
document.addEventListener( 'click', onPointerClicked );
window.addEventListener('resize', onWindowResize);


function createSprite(size, transparent, opacity, color, spriteNumber, range) {
    // texture.magFilter = THREE.NearestFilter;
    var texture = new THREE.TextureLoader().load("sprite-sheet.png");
    texture.repeat.set(1/tilesHoriz, 1/tilesVert);
    texture.offset.x = spriteNumber/tilesHoriz;
    texture.offset.y = 0;
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
    sprite.name = spriteNumber;
    return sprite;
}


function onPointerClicked( event ) {
    if (event.type !== 'click') {
        return;
    }

    if ( selectedObject ) {
        selectedObject = null;
    }

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObject( group, true );
    if ( intersects.length > 0 ) {
        const res = intersects.filter( function ( res ) {
            return res && res.object;
        } )[ 0 ];
        if ( res && res.object ) {
            selectedObject = res.object;
            console.log(selectedObject.name);
        } else {
            console.log('res is null');
        }
    } else {
        console.log('no intersects');
    }
}

function onPointerMove( event ) {
    if ( selectedObject ) {
        // selectedObject.material.color.set( '#69f' );
        selectedObject = null;
    }

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObject( group, true );
    if ( intersects.length > 0 ) {
        const res = intersects.filter( function ( res ) {
            return res && res.object;
        } )[ 0 ];
        if ( res && res.object ) {
            selectedObject = res.object;
            // selectedObject.material.color.set( '#f00' );
        }
    }
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    controls.update();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
}

if ( WebGL.isWebGLAvailable() ) {
    // Initiate function or other initializations here
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById( 'container' ).appendChild( warning );
}
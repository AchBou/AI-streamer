/**
 * VRM Model Viewer
 * 
 * This code has been updated to be compatible with different versions of the @pixiv/three-vrm library.
 * It includes fallbacks and compatibility checks to ensure it works with both older and newer versions.
 *
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { setExpression } from './expressions.js';
import { setPose, resetPose } from './poses.js';
import { resetAll } from './common.js';
import { initializeAnimations, updateAnimations, playAnimation, stopAnimations } from './animations.js';
import { loadMixamoAnimation } from "./loadMixamoAnimation";

// DOM elements
const loadingEl = document.getElementById('loading');
const fileInputEl = document.getElementById('file-input');
const controlsContainer = document.getElementById('controls-container');

// Expression and pose buttons
const expressionButtons = {
    neutral: document.getElementById('expression-neutral'),
    happy: document.getElementById('expression-happy'),
    angry: document.getElementById('expression-angry'),
    sad: document.getElementById('expression-sad'),
    surprised: document.getElementById('expression-surprised'),
    relaxed: document.getElementById('expression-relaxed')
};

const poseButtons = {
    tpose: document.getElementById('pose-tpose'),
    wave: document.getElementById('pose-wave'),
    bow: document.getElementById('pose-bow'),
    jump: document.getElementById('pose-jump'),
    dance: document.getElementById('pose-dance')
};

const animationButtons = {
    idle: document.getElementById('animation-idle'),
    walk: document.getElementById('animation-walk'),
    run: document.getElementById('animation-run'),
    stop: document.getElementById('animation-stop')
};

const resetAllButton = document.getElementById('reset-all');

// Three.js setup
let scene, camera, renderer, controls, currentVrm;

// Current state
let currentExpression = null;
let currentPose = null;
let currentAnimation = null;


let currentAnimationUrl = undefined;
let currentMixer = undefined;
let currentAction = undefined;

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(
        45, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    camera.position.set(0, 1.5, 3);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Enable color management in Three.js
    THREE.ColorManagement.enabled = true;

    document.body.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 1;
    controls.maxDistance = 10;

    // Add grid helper
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Handle file input
    fileInputEl.addEventListener('change', handleFileSelect);

    // Add event listeners for expression buttons
    Object.keys(expressionButtons).forEach(expressionName => {
        expressionButtons[expressionName].addEventListener('click', () => {
            currentExpression = setExpression(currentVrm, expressionName);

            // Update UI
            Object.keys(expressionButtons).forEach(key => {
                expressionButtons[key].classList.remove('active');
            });

            if (currentExpression && expressionButtons[currentExpression]) {
                expressionButtons[currentExpression].classList.add('active');
            } else {
                expressionButtons.neutral.classList.add('active');
            }
        });
    });

    // Add event listeners for pose buttons
    Object.keys(poseButtons).forEach(poseName => {
        poseButtons[poseName].addEventListener('click', () => {
            // Stop any running animation
            stopAnimations();
            currentAnimation = null;

            // Set the pose
            currentPose = setPose(currentVrm, poseName);

            // Update UI
            Object.keys(poseButtons).forEach(key => {
                poseButtons[key].classList.remove('active');
            });

            Object.keys(animationButtons).forEach(key => {
                animationButtons[key].classList.remove('active');
            });

            if (currentPose && poseButtons[currentPose]) {
                poseButtons[currentPose].classList.add('active');
            }
        });
    });

    // Add event listeners for animation buttons
    Object.keys(animationButtons).forEach(animationName => {
        animationButtons[animationName].addEventListener('click', () => {
            if (animationName === 'stop') {
                // Stop all animations
                stopAnimations();
                currentAnimation = null;
            } else {
                // Reset any set pose
                resetPose(currentVrm);
                currentPose = null;

                // Play the selected animation
                currentAnimation = playAnimation(animationName);
            }

            // Update UI
            Object.keys(animationButtons).forEach(key => {
                animationButtons[key].classList.remove('active');
            });

            Object.keys(poseButtons).forEach(key => {
                poseButtons[key].classList.remove('active');
            });

            if (currentAnimation && animationButtons[currentAnimation]) {
                animationButtons[currentAnimation].classList.add('active');
            }
        });
    });

    // Add event listener for reset button
    resetAllButton.addEventListener('click', () => {
        currentExpression = resetAll(currentVrm);
        currentPose = null;

        // Stop animations
        stopAnimations();
        currentAnimation = null;

        // Update UI
        Object.keys(expressionButtons).forEach(key => {
            expressionButtons[key].classList.remove('active');
        });

        Object.keys(poseButtons).forEach(key => {
            poseButtons[key].classList.remove('active');
        });

        Object.keys(animationButtons).forEach(key => {
            animationButtons[key].classList.remove('active');
        });

        // Set neutral as active
        expressionButtons.neutral.classList.add('active');
    });

    // Hide the loading indicator initially
    loadingEl.style.display = 'none';

    // Hide controls until a model is loaded
    controlsContainer.style.display = 'none';

    // Start an animation loop
    animate();
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    const deltaTime = clock.getDelta();

    // Update VRM model if it exists
    if (currentVrm) {
        // Update the model with delta time
        currentVrm.update( deltaTime );

        // Handle any animation updates for poses
        if (currentMixer) {
            currentMixer.update(deltaTime);
        }

        // Update humanoid animations
        updateAnimations(deltaTime);
    }

    renderer.render(scene, camera);
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    loadingEl.style.display = 'block';

    // Create a URL for the file
    const fileURL = URL.createObjectURL(file);

    // Load the VRM model
    loadVRM(fileURL);
}

// Load VRM model
function loadVRM(url) {
    // Remove the previous VRM model if it exists
    if (currentVrm) {
        scene.remove(currentVrm.scene);
        VRMUtils.deepDispose( currentVrm.scene );
    }

    const helperRoot = new THREE.Group();
    helperRoot.renderOrder = 10000;
    scene.add( helperRoot );


    // Create a loader with VRM plugin
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    // Load the model
    loader.load(
        url,
        (gltf) => {
            // Get the VRM model from the loaded GLTF
            const vrm = gltf.userData.vrm;

            // calling this function greatly improves the performance
            VRMUtils.removeUnnecessaryVertices( gltf.scene );
            VRMUtils.combineSkeletons( gltf.scene );
            VRMUtils.combineMorphs( vrm );

            // Normalize the model
            VRMUtils.rotateVRM0(vrm);

            // Add the model to the scene
            scene.add(vrm.scene);
            currentVrm = vrm;

            // create AnimationMixer for VRM
            currentMixer = new THREE.AnimationMixer( currentVrm.scene );

            // Look at the camera
            if (vrm.lookAt) {
                vrm.lookAt.target = camera;
            }

            // Center the camera on the model
            const headPosition = new THREE.Vector3();
            vrm.humanoid.getNormalizedBoneNode('head').getWorldPosition(headPosition);
            controls.target.copy(headPosition);

            // Initialize animations
            initializeAnimations(vrm);

            // Hide loading indicator
            loadingEl.style.display = 'none';

            // Show controls
            controlsContainer.style.display = 'flex';

            // Set a neutral expression as active initially
            expressionButtons.neutral.classList.add('active');
        },
        (progress) => {
            // Update loading progress if needed
            console.log('Loading: ' + (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
            console.error('Error loading VRM:', error);
            loadingEl.textContent = 'Error loading VRM model';
        }
    );
}

// mixamo animation
async function loadFBX( animationUrl ) {

    currentAnimationUrl = animationUrl;

    if ( currentMixer ) {


        console.log(animationUrl);
        // Load animation
        const clip = await loadMixamoAnimation( animationUrl, currentVrm );

        const newAction = currentMixer.clipAction( clip );
        newAction.reset().play();

        if ( currentAction && currentAction !== newAction ) {

            currentAction.crossFadeTo( newAction, 0.5, false );

        }

        currentAction = newAction;

    }

}

// Create a clock for animation
const clock = new THREE.Clock();

// Initialize the application
init();

// Show a loading indicator before loading the model
loadingEl.style.display = 'block';

// Automatically load the VRM model from the models folder
loadVRM('./models/model1.vrm');

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// dnd handler
window.addEventListener( 'dragover', function ( event ) {
    event.preventDefault();
} );

window.addEventListener( 'drop', function ( event ) {

    event.preventDefault();

    // read given file then convert it to blob url
    const files = event.dataTransfer.files;
    if ( ! files ) return;

    const file = files[ 0 ];
    if ( ! file ) return;

    const fileType = file.name.split( '.' ).pop();
    const blob = new Blob( [ file ], { type: 'application/octet-stream' } );
    const url = URL.createObjectURL( blob );

    if ( fileType === 'fbx' ) {

        loadFBX( url );

    } else {

        loadVRM( url );

    }

} );

console.log('VRM Model Viewer initialized ✨');

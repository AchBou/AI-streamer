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
import { CubeTextureLoader } from 'three/src/loaders/CubeTextureLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

import { initializeAnimations, updateAnimations, stopAnimations } from '../animation/animations.js';
import { loadAnimationByName, getAvailableAnimations, addAnimation } from '../animation/animationLoader.js';
import { initTwitchChat } from '../twitch/twitchChat.js';

// DOM elements
const loadingEl = document.getElementById('loading');

// Three.js setup
let scene, camera, renderer, controls, currentVrm;

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
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
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

    // Load skybox textures
    const loadSkybox = () => {
        const loader = new CubeTextureLoader();
        const path = './skybox/';
        const format = '.jpg';
        const urls = [
            path + 'px' + format, // positive x
            path + 'nx' + format, // negative x
            path + 'py' + format, // positive y
            path + 'ny' + format, // negative y
            path + 'pz' + format, // positive z
            path + 'nz' + format  // negative z
        ];

        loader.load(urls, (cubeTexture) => {
            scene.background = cubeTexture;
            console.log('Skybox loaded successfully');
        }, undefined, (error) => {
            console.warn('Failed to load skybox textures:', error);
            // Fallback to solid color background
            scene.background = new THREE.Color(0x87CEEB); // Light sky blue
        });
    };

    // Try to load skybox, fallback to solid color if textures not available
    try {
        loadSkybox();
    } catch (error) {
        console.warn('Error setting up skybox:', error);
        scene.background = new THREE.Color(0x87CEEB); // Light sky blue
    }

    // Handle window resize
    window.addEventListener('resize', onWindowResize);


    // UI controls have been removed as per requirements
    // All model control is now handled programmatically

    // In a real application, you would implement code here to scan the models folder
    // and create buttons for each VRM file found in the folder.
    // This could be done through a server-side API, a build process, or a static JSON file
    // that's generated during the build process.
    //
    // Example implementation (pseudo-code):
    // 
    // fetch('./models-list.json')
    //     .then(response => response.json())
    //     .then(data => {
    //         data.forEach(model => {
    //             if (!modelButtons[model.name]) {
    //                 // Create a button element
    //                 const button = document.createElement('button');
    //                 button.id = `model-${model.name}`;
    //                 button.textContent = model.name.charAt(0).toUpperCase() + model.name.slice(1);
    //                 
    //                 // Add event listener
    //                 button.addEventListener('click', () => {
    //                     loadVRM(`./models/${model.file}`);
    //                     
    //                     // Update UI
    //                     Object.keys(modelButtons).forEach(key => {
    //                         modelButtons[key].classList.remove('active');
    //                     });
    //                     
    //                     button.classList.add('active');
    //                 });
    //                 
    //                 // Add to container and store reference
    //                 modelButtonsContainer.appendChild(button);
    //                 modelButtons[model.name] = button;
    //             }
    //         });
    //     })
    //     .catch(error => {
    //         console.error('Error loading models list:', error);
    //     });
    //
    // For now, we'll just use drag and drop functionality for loading models.

    // Get available animations from the mapping (for programmatic use)
    const availableAnimations = getAvailableAnimations();

    // Hide the loading indicator initially
    loadingEl.style.display = 'none';

    // Initialize Twitch chat integration
    // You can specify a channel name here, or it will use the default
    initTwitchChat({
        channel: 'therumblee', // Change this to your preferred Twitch channel
        anonymous: true // Connect anonymously (no auth required)
    });

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

// Load VRM model
function loadVRM(url) {
    // Remove the previous VRM model if it exists
    if (currentVrm) {
        scene.remove(currentVrm.scene);
        VRMUtils.deepDispose( currentVrm.scene );
    }



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

            // Automatically start with silly dancing animation
            loadAnimation('dance');
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

// Load animation by name
export async function loadAnimation(animationName) {
    if (!currentMixer || !currentVrm) {
        console.error('Cannot load animation: No mixer or VRM model available');
        return;
    }

    try {
        console.log(`Loading animation: ${animationName}`);

        // Load the animation by name
        const result = await loadAnimationByName(animationName, currentVrm, currentMixer, currentAction);

        // Update the current action
        currentAction = result.action;

        return result;
    } catch (error) {
        console.error(`Error loading animation "${animationName}":`, error);
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
    const fileName = file.name;
    const blob = new Blob( [ file ], { type: 'application/octet-stream' } );
    const url = URL.createObjectURL( blob );

    if ( fileType === 'fbx' ) {
        // Extract the animation name from the file name
        const animationName = fileName.replace('.fbx', '').toLowerCase();

        // Add the animation to the mapping (in-memory only)
        // This allows us to use the animation by name
        addAnimation(animationName, url);

        // Load the animation by name
        loadAnimation(animationName);
    } else if (fileType === 'vrm') {
        // Load the VRM model
        loadVRM( url );

        // Note: The loadVRM function will automatically start the silly dancing animation
        // as we've updated it to do so after loading the model
    } else {
        console.warn('Unsupported file type:', fileType);
    }
} );

console.log('VRM Model Viewer initialized ✨');

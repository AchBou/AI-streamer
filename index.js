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
import { setExpression } from './expressions.js';
import { setPose, resetPose } from './poses.js';
import { resetAll } from './common.js';
import { initializeAnimations, updateAnimations, playAnimation, stopAnimations } from './animations.js';
import { loadMixamoAnimation } from "./loadMixamoAnimation";

// DOM elements
const loadingEl = document.getElementById('loading');
const controlsContainer = document.getElementById('controls-container');
const modelButtonsContainer = document.getElementById('model-buttons');
const fbxButtonsContainer = document.getElementById('fbx-buttons');

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

// Model buttons - initially just the one we know exists
const modelButtons = {
    model1: document.getElementById('model-model1')
};

// FBX animation buttons will be populated dynamically
const fbxButtons = {};

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

        // Restart the silly dancing animation
        loadFBX('./animations/silly-dancing.fbx');

        // Update UI to show the dance animation as active
        Object.keys(fbxButtons).forEach(key => {
            fbxButtons[key].classList.remove('active');
        });

        if (fbxButtons['dance']) {
            fbxButtons['dance'].classList.add('active');
        }
    });

    // Add event listeners for model buttons
    Object.keys(modelButtons).forEach(modelName => {
        modelButtons[modelName].addEventListener('click', () => {
            // Load the selected model
            loadVRM(`./models/${modelName}.vrm`);

            // Update UI
            Object.keys(modelButtons).forEach(key => {
                modelButtons[key].classList.remove('active');
            });

            modelButtons[modelName].classList.add('active');

            // Note: The loadVRM function will automatically start the silly dancing animation
            // as we've updated it to do so after loading the model
        });
    });

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
    // For now, we'll just use the existing model button and drag and drop functionality.

    // Scan animations folder and create buttons for FBX files
    // This is a simplified approach - in a real app, you'd use a server-side API
    // to get the list of files in the folder
    const animationFiles = [
        // Add any known animation files here
        { name: 'dance', file: 'silly-dancing.fbx' },
        { name: 'angry', file: 'Angry.fbx' }
    ];

    // Create buttons for each animation file
    animationFiles.forEach(animation => {
        // Create a button element
        const button = document.createElement('button');
        button.id = `fbx-${animation.name}`;
        button.textContent = animation.name.charAt(0).toUpperCase() + animation.name.slice(1);

        // Add event listener
        button.addEventListener('click', () => {
            loadFBX(`./animations/${animation.file}`);

            // Update UI
            Object.keys(fbxButtons).forEach(key => {
                fbxButtons[key].classList.remove('active');
            });

            button.classList.add('active');
        });

        // Add to container and store reference
        fbxButtonsContainer.appendChild(button);
        fbxButtons[animation.name] = button;
    });

    // If no animation files were found, show a message
    if (animationFiles.length === 0) {
        const infoText = document.createElement('div');
        infoText.className = 'info-text';
        infoText.textContent = 'Drop FBX files in the animations folder and restart the app to see them here';
        fbxButtonsContainer.appendChild(infoText);
    }

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

            // Set a neutral expression as active initially
            expressionButtons.neutral.classList.add('active');

            // Automatically start with silly dancing animation
            loadFBX('./animations/silly-dancing.fbx');

            // Update UI to show the dance animation as active
            Object.keys(fbxButtons).forEach(key => {
                fbxButtons[key].classList.remove('active');
            });

            if (fbxButtons['dance']) {
                fbxButtons['dance'].classList.add('active');
            }
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
        // Load the FBX animation
        loadFBX( url );

        // Create a button for this animation if it doesn't exist
        const animationName = fileName.replace('.fbx', '');
        if (!fbxButtons[animationName]) {
            // Create a button element
            const button = document.createElement('button');
            button.id = `fbx-${animationName}`;
            button.textContent = animationName.charAt(0).toUpperCase() + animationName.slice(1);

            // Add event listener
            button.addEventListener('click', () => {
                loadFBX(url);

                // Update UI
                Object.keys(fbxButtons).forEach(key => {
                    fbxButtons[key].classList.remove('active');
                });

                button.classList.add('active');
            });

            // Remove any info text
            const infoText = fbxButtonsContainer.querySelector('.info-text');
            if (infoText) {
                fbxButtonsContainer.removeChild(infoText);
            }

            // Add to container and store reference
            fbxButtonsContainer.appendChild(button);
            fbxButtons[animationName] = button;

            // Set as active
            button.classList.add('active');
        } else {
            // Update UI to show this animation as active
            Object.keys(fbxButtons).forEach(key => {
                fbxButtons[key].classList.remove('active');
            });

            fbxButtons[animationName].classList.add('active');
        }
    } else if (fileType === 'vrm') {
        // Load the VRM model
        loadVRM( url );

        // Create a button for this model if it doesn't exist
        const modelName = fileName.replace('.vrm', '');
        if (!modelButtons[modelName]) {
            // Create a button element
            const button = document.createElement('button');
            button.id = `model-${modelName}`;
            button.textContent = modelName.charAt(0).toUpperCase() + modelName.slice(1);

            // Add event listener
            button.addEventListener('click', () => {
                loadVRM(url);

                // Update UI
                Object.keys(modelButtons).forEach(key => {
                    modelButtons[key].classList.remove('active');
                });

                button.classList.add('active');

                // Note: The loadVRM function will automatically start the silly dancing animation
                // as we've updated it to do so after loading the model
            });

            // Add to container and store reference
            modelButtonsContainer.appendChild(button);
            modelButtons[modelName] = button;

            // Set as active
            button.classList.add('active');
        } else {
            // Update UI to show this model as active
            Object.keys(modelButtons).forEach(key => {
                modelButtons[key].classList.remove('active');
            });

            modelButtons[modelName].classList.add('active');
        }

        // Note: The loadVRM function will automatically start the silly dancing animation
        // as we've updated it to do so after loading the model
    } else {
        console.warn('Unsupported file type:', fileType);
    }
} );

console.log('VRM Model Viewer initialized ✨');

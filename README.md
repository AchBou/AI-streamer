# Three.js VRM Model Viewer

A simple Three.js project that loads and displays VRM 3D character models.

## About VRM

VRM is a file format for handling 3D humanoid avatar data for VR applications. It's based on glTF2.0 and is used in various applications, including VTuber software, games, and VR/AR applications.

## Features

- Load and display VRM models
- Orbit controls to rotate and zoom the camera
- Responsive design that adapts to window size
- File input to load your own VRM models
- Facial expressions (happy, angry, sad, surprised, relaxed)
- Pose animations (T-pose, wave, bow, jump, dance)

## Prerequisites

- Node.js (v14 or later recommended)
- npm (comes with Node.js)

## Installation

1. Clone this repository or download the source code
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Development

To start the development server:

```bash
npm start
```

This will open the application in your default web browser. The page will automatically reload if you make changes to the code.

## Building for Production

To build the application for production:

```bash
npm run build
```

This will create a `dist` folder with the compiled assets.

## Usage

1. Open the application in your browser
2. Click the "Choose File" button in the top-left corner
3. Select a VRM file from your computer
4. The model will be loaded and displayed in the viewer
5. Use your mouse to interact with the model:
   - Left-click and drag to rotate the view
   - Scroll to zoom in and out
6. Use the control panel at the bottom-left to animate the model:
   - Click on expression buttons (Happy, Angry, Sad, etc.) to change facial expressions
   - Click on pose buttons (T-Pose, Wave, Bow, etc.) to change body poses
   - Click "Reset All" to return to the default state

## Where to Find VRM Models

You can find VRM models from various sources:

- [VRoid Hub](https://hub.vroid.com/) - A platform for sharing and discovering VRM models
- [The Seed Online](https://seed.online/) - Another platform for VRM models
- [VRM Consortium](https://vrm-consortium.org/) - Official VRM website with sample models

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Three.js](https://threejs.org/) - JavaScript 3D library
- [@pixiv/three-vrm](https://github.com/pixiv/three-vrm) - VRM file loader and utilities for Three.js

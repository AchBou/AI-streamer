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
- Twitch chat integration
- OpenAI GPT integration for automated responses
- Server-side API for secure OpenAI interactions

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

### Client-Only Mode

To start the development server for the client only:

```bash
npm start
```

This will open the application in your default web browser. The page will automatically reload if you make changes to the code.

### Server Setup

Before running the server, you need to set up your environment variables:

1. Create a `.env` file in the root directory (or rename the `.env.example` file)
2. Add your OpenAI API key to the `.env` file:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### Running the Server

To start the server only:

```bash
npm run server
```

### Running Both Client and Server

To run both the client and server concurrently:

```bash
npm run dev
```

This will start both the webpack dev server for the client and the Express server for the OpenAI API.

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

## OpenAI Integration

This project includes integration with OpenAI's GPT models to generate responses to Twitch chat messages. The integration works as follows:

1. When a message is received in the Twitch chat, it's sent to the server
2. The server processes the message and decides whether to generate a response based on:
   - Cooldown period (to avoid spamming)
   - Response threshold (random chance to respond)
   - Message filtering (ignoring commands and specific users)
3. If a response should be generated, the server sends a request to the OpenAI API
4. The response is sent back to the client and displayed in the chat

The server-side implementation ensures that your OpenAI API key is kept secure and not exposed in client-side code.

### Configuration

You can configure the OpenAI integration by editing the `config/gpt.config.js` file. This includes settings for:

- Model selection (gpt-3.5-turbo, gpt-4, etc.)
- Response parameters (max tokens, temperature)
- Bot personality (system prompt)
- Response behavior (threshold, cooldown)
- Message filtering (ignore commands, ignore users)
- Animation triggers (words that trigger specific animations)

## Acknowledgments

- [Three.js](https://threejs.org/) - JavaScript 3D library
- [@pixiv/three-vrm](https://github.com/pixiv/three-vrm) - VRM file loader and utilities for Three.js
- [OpenAI](https://openai.com/) - AI models for chat responses
- [Express](https://expressjs.com/) - Web server framework
- [tmi.js](https://tmijs.com/) - Twitch messaging interface

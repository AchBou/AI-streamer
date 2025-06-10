# FBX Animations Folder

This folder is used to store FBX animation files for the VRM Model Viewer application.

## How to Add Animations

There are two ways to add FBX animations to the application:

1. **Drag and Drop**: Simply drag and drop an FBX file onto the application window. The animation will be loaded immediately, and a button will be created for it in the "FBX Animations" section.

2. **Copy Files**: Copy your FBX animation files directly into this folder. When you restart the application, buttons for these animations will appear in the "FBX Animations" section.

## Supported Animations

The application supports Mixamo animations that can be applied to VRM models. For best results, use animations exported from Mixamo with the following settings:

- Format: FBX
- Skin: With Skin
- Frames per second: 30
- No keyframe reduction
- Forward direction: Z

## Troubleshooting

If your animation doesn't appear correctly:
- Make sure the FBX file is a valid Mixamo animation
- Try exporting the animation from Mixamo with different settings
- Check the browser console for any error messages
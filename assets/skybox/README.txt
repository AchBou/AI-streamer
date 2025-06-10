# Skybox Textures Folder

This folder is used to store the skybox textures for the 3D scene background.

## How to Add Skybox Textures

To create a skybox background, you need to add six image files to this folder, one for each face of the cube:

1. `px.jpg` - Positive X face (right)
2. `nx.jpg` - Negative X face (left)
3. `py.jpg` - Positive Y face (top)
4. `ny.jpg` - Negative Y face (bottom)
5. `pz.jpg` - Positive Z face (front)
6. `nz.jpg` - Negative Z face (back)

All images should be square (e.g., 1024x1024 pixels) and in JPG format.

## Finding Skybox Textures

You can find free skybox textures from various sources:

- [OpenGameArt.org](https://opengameart.org/art-search-advanced?keys=skybox)
- [Humus Cubemap Textures](http://www.humus.name/index.php?page=Textures)
- [HDRI Haven](https://hdrihaven.com/) (requires conversion to cubemap format)

## Usage Notes

- If the skybox textures are not found, the application will fall back to a solid color background.
- For best results, use high-quality, seamless textures.
- Make sure the textures are properly aligned to avoid visible seams.
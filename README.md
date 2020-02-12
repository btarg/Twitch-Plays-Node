# Twitch-Plays-Node
 An implementation of "Twitch Plays" written in Node.JS with special commands.

Custom controls can be set up by editing the `names` section of `scripts/keycodes.json`. An example of a valid ID would be `DIK_ESCAPE:0`, meaning press `DIK_ESCAPE` for `0` seconds (don't hold the key down).

## Building
Build for Windows using:
```
pkg . --targets node12-win-x64
```
The app currently doesn't work on Linux or Mac.

## Default keymap bindings
The default bindings are made for Chocolate Doom, using WASD as the movement and turning controls.

## Extra notes
This app requires Python 3.x to run. The executable name used is `python`.
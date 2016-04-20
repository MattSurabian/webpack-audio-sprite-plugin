# Webpack Audio Sprite Plugin & Loader

When used together this plugin and loader automate the creation of audio 
sprites and their accompanying manifests. Generated sprites are automatically 
chunked and sized so they can be delivered intelligently to the browser along
with the code that depends upon them.

## Usage Example

```
var AudioSpritePlugin = require("webpack-audio-sprite-plugin");
module.exports = {
    module: {
        loaders: [
            { 
              test: /\.mp3$/, 
              loader: AudioSpritePlugin.loader() 
            }
        ]
    },
    plugins: [
        new AudioSpritePlugin()
    ]
}
```

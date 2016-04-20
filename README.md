**_This plugin and loader are still in active development and not feature complete_**

# Webpack Audio Sprite Plugin & Loader

[![Build Status](https://ci.appveyor.com/api/projects/status/github/mattsurabian/webpack-audio-sprite-plugin?branch=master&svg=true)](https://ci.appveyor.com/project/MattSurabian/webpack-audio-sprite-plugin)
[![Build Status](https://travis-ci.org/MattSurabian/webpack-audio-sprite-plugin.svg?branch=master)](https://travis-ci.org/MattSurabian/webpack-audio-sprite-plugin)

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

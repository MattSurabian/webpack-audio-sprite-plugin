'use strict';

var AudioSpritePlugin = require("../../index");

module.exports = {
	entry: {
		main: "./index.js"
	},
	output: {
		path: "dist",
		filename: "[name].js"
	},
	module: {
		loaders: [
			{
				test: /\.mp3$/,
				loader: AudioSpritePlugin.loader()
			},
			{
				test: /\.json$/,
				loader: 'json-loader'
			}
		]
	},
	plugins: [
		new AudioSpritePlugin()
	]
};

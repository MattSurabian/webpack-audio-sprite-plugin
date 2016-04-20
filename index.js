'use strict';

var pluginErrors = require('./lib/errors');
var spawnSync = require('child_process').spawnSync;

var preFlightCheck = spawnSync('ffmpeg', ['-version']).error === undefined;

function AudioSpritePlugin (options) {}

AudioSpritePlugin.loader = function(options) {
  return require.resolve("./loader") + (options ? "?" + JSON.stringify(options) : "");
};

AudioSpritePlugin.prototype.loader = function(options) {
	options = JSON.parse(JSON.stringify(options || {}));
	options.id = this.id;
	return AudioSpritePlugin.loader(options);
};

AudioSpritePlugin.prototype.apply = function(compiler) {
	compiler.plugin('compilation', function(compilation) {
		if (!preFlightCheck) {
			compilation.errors.push(pluginErrors.preflightError);
		}
	});

};

module.exports = AudioSpritePlugin;

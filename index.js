'use strict';

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

};

module.exports = AudioSpritePlugin;

'use strict';

var path = require('path');
var crypto = require('crypto');
var pluginErrors = require('./lib/errors');
var spawnSync = require('child_process').spawnSync;
var NormalModule = require('webpack/lib/NormalModule');
var OriginalSource = require('webpack/lib/OriginalSource');
var preFlightCheck = spawnSync('ffmpeg', ['-version']).error === undefined;

var soundDataCache = {};

// TODO: Document
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
  var _this = this;
  compiler.plugin('compilation', function(compilation, params) {
    if (!preFlightCheck) {
      compilation.errors.push(pluginErrors.preflightError);
    }

    compilation.plugin("normal-module-loader", function(loaderContext, module) {
      loaderContext[__dirname] = _this;
    });
    
    params.normalModuleFactory.plugin('resolver', function(resolver) {
      return function(request, callback) {
        var cacheKey = request.request.split('/').pop();
        if (soundDataCache[cacheKey]) {
          var module = new NormalModule(request.request, request.request, request.request, [], request.request, params.normalModuleFactory.parser);
          module.build = function(options, compilation, resolver, fs, callback) {
            NormalModule.prototype.build.call(this, options, compilation, resolver, {
              readFile: function(filepath, callback) {
                var buffy = new Buffer(`module.exports = {${soundDataCache[cacheKey].getManifestEntryString()}};`);
                callback(null, buffy);
              }
            }, callback);
          };
          callback(null, module);
        } else {
          resolver.apply(null, arguments);
        }
      };
    });
  });

};

// TODO Document
AudioSpritePlugin.prototype.addSound = function(sound) {
  soundDataCache[sound.id] = sound;
};

module.exports = AudioSpritePlugin;

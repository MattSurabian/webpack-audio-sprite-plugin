'use strict';

var path = require('path');
var hashId = require('./lib/hashId');
var pluginErrors = require('./lib/errors');
var RewritableModule = require('./lib/rewritableModule');
var spawnSync = require('child_process').spawnSync;
var preFlightCheck = spawnSync('ffmpeg', ['-version']).error === undefined;

var loaderPath = path.join(__dirname, 'loader.js');

// TODO: Document
function AudioSpritePlugin (options) {
  this.manifestCache = {};
}

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
        var manifest = _this.manifestCache[path.basename(request.request)];
        if (manifest) {
          callback(null, new RewritableModule(request, params.normalModuleFactory.parser, `{${manifest}};`));
        } else {
          resolver.apply(null, arguments);
        }
      };
    });

    compilation.plugin('optimize-tree', function(chunks, modules, cb) {
      chunks.forEach(function(chunk) {
        var chunkAudioModules = [];
        var chunkManifestBody = '';
        
        chunk.modules.forEach(function(module) {
          if (module.loaders.indexOf(loaderPath) !== -1) {
            var moduleManifest = _this.manifestCache[hashId.deterministic(module.resource)];
            if (moduleManifest) {
              if (chunkAudioModules.length > 0) {
                chunkManifestBody += ',';
              }
              chunkManifestBody += moduleManifest;
              chunkAudioModules.push(module);
            }
          }
        });

        var chunkManifestPath = null;
        Promise.all(chunkAudioModules.map(function(module, moduleIndex) {
            return new Promise(function(resolve, reject) {
              module.dependencies.forEach(function(dep) {
                if (_this.manifestCache[path.basename(dep.request)]) {
                  var moduleBody;
                  if (moduleIndex === 0) {
                    moduleBody = `{${chunkManifestBody}};`;
                    chunkManifestPath = dep.module.request;
                  } else {
                    moduleBody = `require("${chunkManifestPath}");`;
                  }

                  dep.module.setBodySoon(moduleBody);
                  compilation.rebuildModule(dep.module, resolve);
                } else {
                  resolve();
                }
              });
            });
          }))
          .then(function() {
            cb(null);
          });
      });
    });
  });
};

/**
 * Helper method that can be used by loaders to add sounds into the audio info
 * cache
 * @param sound
 */
AudioSpritePlugin.prototype.addSound = function(sound) {
  this.manifestCache[sound.id] = sound.getManifestEntryString();
};

module.exports = AudioSpritePlugin;

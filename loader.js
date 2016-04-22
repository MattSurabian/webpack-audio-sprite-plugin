'use strict';

var loaderUtils = require('loader-utils');
var path = require('path');
var ffprobe = require('./lib/ffprobe');
var AudioModule = require('./lib/audioInfo');

/**
 * AudioSpriteLoader
 * This loader takes a request for an audio file and returns the source code
 * of a module of the form:
 * 
 *   { "manifest": MANIFEST, "id": ID }
 *   
 * Where manifest is either a require call to a manifest file that the audio
 * sprite plugin will resolve or the manifest inlined in the case that this
 * loader is used without the plugin.
 * 
 * Accepts the following query params:
 *   [metadata=[name].json] This is the pattern to use when searching for
 *   the companion metadatafile that goes along with this audio file.
 *   
 * @returns {string}
 */
module.exports = function() {
  ffprobe.preFlightCheck();

  var queryParams = loaderUtils.parseQuery(this.query);
  var metadataPattern = queryParams.metadata || '[name].json';
  var metadataFileName = loaderUtils.interpolateName(this, metadataPattern, {});
  var metadataFilePath = path.join(this.context, metadataFileName);
  var plugin = this[path.normalize(path.join(__dirname))] || null;
  
  this.cacheable && this.cacheable();
  var callback = this.async();
  
  if (!callback) {
    var sound = new AudioModule({
      resourcePath: this.resourcePath,
      metadataFilePath: metadataFilePath,
      optimizePlugin: plugin,
      async: false
    });
    return sound.getModuleString();
  } else {
    var _this = this;
    Promise.resolve()
      .then(function() {
        return new AudioModule({
          resourcePath: _this.resourcePath,
          metadataFilePath: metadataFilePath,
          optimizePlugin: plugin
        })
      })
      .then(function(audio) {
        if (plugin) {
          plugin.addSound(audio);
        }
        callback(null, audio.getModuleString());
      })
      .catch(callback);
  }
};

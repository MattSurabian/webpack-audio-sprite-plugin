'use strict';

var ffmpeg = require('./lib/ffmpeg');
var Manifest = require('./lib/manifestEntry');

module.exports = function() {
  // Will throw an error if ffprobe isn't available
  ffmpeg.preFlightCheck();

  this.cacheable && this.cacheable();
  var callback = this.async();

  if (!callback) {
    var fileInfo = ffmpeg.getFileInfoSync(this.resourcePath);
    return new Manifest(this, fileInfo).getModuleSync();
  } else {
    var _this = this;
    Promise.resolve()
      .then(ffmpeg.getFileInfo.bind(null, this.resourcePath))
      .then(function(fileInfo) {
        return Manifest(_this, fileInfo).getModule();
      })
      .then(function(manifestModule) {
        callback(null, manifestModule);
      })
      .catch(callback);
  }
};

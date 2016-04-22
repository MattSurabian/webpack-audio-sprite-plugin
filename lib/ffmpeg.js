'use strict';

var childProcess = require('child_process');
var spawnSync = childProcess.spawnSync;
var spawn = childProcess.spawn;

var pluginErrors = require('./errors');

var probeParams = ['-v','quiet', '-print_format', 'json', '-show_format'];

var preFlightCheck = spawnSync('ffprobe', ['-version']).error === undefined;

module.exports = {

  preFlightCheck: function() {
    if (!preFlightCheck) {
      throw new Error(pluginErrors.preflightError);
    }
  },

  getFileInfo: function(filePath) {
    return new Promise(function(resolve, reject) {
      var ffprobe = spawn(
        'ffprobe',
        probeParams.concat([filePath])
      );
      var fileInfo = '';

      ffprobe.stdout.on('data', function(response) {
        fileInfo += response.toString();
      });

      ffprobe.stdout.on('close', function() {
        resolve(fileInfo);
      });

      ffprobe.stderr.on('data', function() {
        reject(pluginErrors.probeError);
      });

      ffprobe.on('error', function() {
        reject(pluginErrors.probeError);
      });
    })
      .then(JSON.parse)
      .then(function(fileInfo) {
        if (Object.keys(fileInfo).length === 0) {
          throw new Error(pluginErrors.probeError);
        } else {
          return fileInfo.format;
        }
      });
  },

  getFileInfoSync: function(filePath) {
    var ffprobeResponse = spawnSync(
      'ffprobe',
      probeParams.concat([filePath])
    );
    var fileInfo = JSON.parse(ffprobeResponse.stdout.toString());

    if (ffprobeResponse.error !== undefined || Object.keys(fileInfo).length === 0) {
      throw new Error(pluginErrors.probeError);
    }

    return fileInfo.format;
  }
};

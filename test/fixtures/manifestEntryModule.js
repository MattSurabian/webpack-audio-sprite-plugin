'use strict';

var path = require('path');

module.exports = function(fileName, fileInfo, metadataFileName) {

  var manifest = {
    path: path.join('fixtures', fileName),
    duration: fileInfo.duration,
    size: fileInfo.size,
    format: "mp3",
    metadata: metadataFileName ? 'REPLACE' : {}
  };

  if (!metadataFileName) {
    metadataFileName = '';
  }

  return 'module.exports = ' + JSON.stringify(manifest).replace('"REPLACE"', 'require("' + metadataFileName + '")') + ';';
};

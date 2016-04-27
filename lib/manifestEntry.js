'use strict';

var fs = require('fs');
var path = require('path');
var loaderUtils = require('loader-utils');

function ManifestEntry(loaderContext, fileInfo) {
  
  if (!(this instanceof ManifestEntry)) {
    return new ManifestEntry(loaderContext, fileInfo);
  }

  this.loaderContext = loaderContext;
  this.resourcePath = loaderContext.resourcePath;
  this.compilerContext = loaderContext.options.context;
  this.fileBasePath = loaderContext.context;
  this.fileInfo = fileInfo;

  var queryParams = loaderUtils.parseQuery(this.loaderContext.query);
  var metadataPattern = queryParams.metadata || '[name].json';
  var metadataFileName = loaderUtils.interpolateName(this.loaderContext, metadataPattern, {});

  this.metadataFilePath = path.join(this.fileBasePath, metadataFileName);
  this.metadataFileId = loaderUtils.getHashDigest(this.metadataFilePath, 'sha1', 'hex', 40);
  
  this._manifest = {
    path: path.relative(this.compilerContext, this.resourcePath),
    duration: this.fileInfo.duration,
    size: this.fileInfo.size,
    format: this.fileInfo.format_name,
    metadata: {}
  };
}

ManifestEntry.prototype = {

  getModule: function() {
    var _this = this;
    var manifest = this._manifest;
    return new Promise(function(resolve) {
      fs.access(_this.metadataFilePath, function(err) {
        if (!err) {
          manifest.metadata = _this.metadataFileId;
        }
        resolve(generateModule(_this.loaderContext, manifest, _this.metadataFileId, _this.metadataFilePath));
      });
    });
  },

  getModuleSync: function() {
    var manifest = this._manifest;
    try {
      fs.accessSync(this.metadataFilePath);
      manifest.metadata = this.metadataFileId;
    } catch (err) {
      // can't access metadata file or it doesn't exist, noop.
    }
    return generateModule(this.loaderContext, manifest, this.metadataFileId, this.metadataFilePath);
  }

};

function generateModule(context, manifest, metadataFileId, metadataFilePath) {
  return 'module.exports = ' + JSON.stringify(manifest).replace('"' + metadataFileId + '"', 'require(' + loaderUtils.stringifyRequest(context, metadataFilePath) + ')') + ';';
}

module.exports = ManifestEntry;

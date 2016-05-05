'use strict';

var fs = require('fs');
var path = require('path');
var loaderUtils = require('loader-utils');
var hashId = require('./hashId');
var ffprobe = require('./ffprobe');
var errors = require('./errors');

/**
 * @param config Object used to pass class configuration
 * @param {string} config.resourcePath Path to the audio file that was required
 * @param {string} [config.metadataFilePath=null] Path to the audio file's
 * manifest, this file may or may not exist
 * @param {Object} [config.optimizePlugin=null] Instance of the
 * webpack-audio-sprite-plugin if in use
 * @param {boolean} [config.async=true] Boolean that determines whether this
 * should function synchronously or asynchronously
 * @returns {*}
 * @constructor
 */
function AudioInfo(config) {

  // Constructor invocation to ensure predictable behavior when used without new
  if (!(this instanceof AudioInfo)) {
    return new AudioInfo(config);
  }

  this.resourcePath = config.resourcePath;
  this.metadataFilePath = config.metadataFilePath || null;
  this.baseDir = path.dirname(this.resourcePath);
  this.isAsync = config.async || true;
  this.optimizePlugin = config.optimizePlugin || null;
  
  if (!this.resourcePath) {
    throw new Error(errors.audioModuleInstantiationError);
  }
  
  this.id = hashId.deterministic(this.resourcePath);

  if (this.isAsync) {
    return this._init();
  } else {
    return this._initSync();
  }
}

AudioInfo.prototype = {
  /**
   * Initializes the module in an asynchronous way.
   * Collects file info using ffprobe and checks to see if a metadata file
   * exists and can be accessed. If it can this.metadataFileId will be set
   * to a hash we can later use to generate a require call for the actual
   * resource.
   * @returns {AudioInfo}
   * @private
   */
  _init: function() {
    var _this = this;
    return new Promise(function(resolve, reject) {
      ffprobe.getFileInfo(_this.resourcePath)
        .then(function(ffResponse) {
          _this.ffProbeResponse = ffResponse;
          return ffResponse;
        })
        .then(function(ffResponse) {
          if ( _this.metadataFilePath) {
            fs.access(_this.metadataFilePath, function(err) {
              if (!err) {
                _this.metadataFileId = hashId.deterministic(_this.metadataFilePath);
              }
              _this._hydrateFileInfo();
              resolve(_this);
            });
          } else {
            _this._hydrateFileInfo();
            resolve(_this);
          }
        })
        .catch(function(err) {
          throw err;
        });
    });
  },

  /**
   * Initializes the module in a synchronous way.
   * Collects file info using ffprobe and checks to see if a metadata file
   * exists and can be accessed. If it can this.metadataFileId will be set
   * to a hash we can later use to generate a require call for the actual
   * resource.
   * @returns {AudioInfo}
   * @private
   */
  _initSync: function() {
    this.ffProbeResponse = ffprobe.getFileInfoSync(this.resourcePath);
    if (this.metadataFilePath) {
      try {
        fs.accessSync(this.metadataFilePath);
        this.metadataFileId = hashId.deterministic(this.metadataFilePath);
      } catch (err) {
        // can't access metadata file or it doesn't exist, noop.
      }
    }
    this._hydrateFileInfo();
    return this;
  },

  /**
   * Method to populate the module's fileInfo during module initialization
   * @private
   */
  _hydrateFileInfo: function() {
    this.fileInfo = {
      id: this.id,
      path: this.resourcePath,
      format: this.ffProbeResponse.format_name,
      size: this.ffProbeResponse.size,
      duration: this.ffProbeResponse.duration,
      metadata: this.metadataFileId ? this.metadataFileId : {}
    };
  },

  /**
   * Returns a manifest entry as a string of the form:
   *   "MODULE_ID": {FILE_INFO}
   * Note it is not contained in {} and it does not include a trailing comma.
   * This method can be used by the loader while building up single asset
   * manifests when it's used without the plugin, or by the plugin when building
   * multi-asset manifests.
   * @returns {string}
   */
  getManifestEntryString: function() {
    return `"${this.id}": ${this.getFileInfoString()}`;
  },

  /**
   * Returns a string representation of the file info object for use within the
   * manifest entry. If a metadata file was found and able to be
   * accessed a require statement for that file will be generated as the value
   * of the metadata field; otherwise it will be set to an empty object.
   * @returns {string}
   */
  getFileInfoString: function() {
    var infoString = JSON.stringify(this.fileInfo);
    
    if (typeof this.fileInfo.metadata === 'string' && this.metadataFileId) {
      infoString = infoString.replace(`"${this.metadataFileId}"`, `require(${loaderUtils.stringifyRequest(this.baseDir, this.metadataFilePath)})`);
    }
    
    return infoString;
  },

  /**
   * Returns the high level sound asset module of the form:
   *   module.exports = { "manifest": MANIFEST, "id": MODULE_ID };
   * If the optimize plugin is in use MANIFEST will be a require call that
   * the plugin is able to resolve. If the loader is being used without the
   * plugin MANIFEST will be an object containing a single entry generated
   * by the getManifestEntryString method.
   * @returns {string}
   */
  getModuleString: function() {
    var moduleString = 'module.exports = { "manifest":';
    
    if (this.optimizePlugin) {
      moduleString += `require("${path.join(this.baseDir, this.id)}")`;
    } else {
      moduleString += `{${this.getManifestEntryString()}}`
    }
    
    moduleString += `, "id": "${this.id}" };`;
    return moduleString;
  }
};

// Set the constructor so we can still do instance checks
AudioInfo.constructor = AudioInfo;

module.exports = AudioInfo;

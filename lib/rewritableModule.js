'use strict';

var NormalModule = require('webpack/lib/NormalModule');

function RewritableModule(request, parser, body) {
  NormalModule.call(this, request.request, request.request, request.request, [], request.request, parser);
  this.body = body;
  return this;
}

RewritableModule.prototype = Object.create(NormalModule.prototype);

RewritableModule.prototype.setBodySoon = function(body) {
  this.body = body;
};

RewritableModule.prototype.build = function(options, compilation, resolver, fs, callback) {
  var _this = this;
  NormalModule.prototype.build.call(this, options, compilation, resolver, {
    readFile: function(filepath, callback) {
      var buffy = new Buffer(`module.exports = ${_this.body}`);
      callback(null, buffy);
    }
  }, callback);
};

RewritableModule.prototype.constructor = RewritableModule;
module.exports = RewritableModule;

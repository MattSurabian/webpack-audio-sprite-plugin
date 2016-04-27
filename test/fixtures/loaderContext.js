'use strict';

var path = require('path');

module.exports = function(filename, queryString) {
  if (!queryString) {
    queryString = '';
  }
  
  return {
    resourcePath: path.join(__dirname, filename),
    context: __dirname,
    query: queryString,
    options: {
      context: path.join(__dirname, '..'),
      debug: false
    }
  }
  
};

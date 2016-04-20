'use strict';

var pluginErrors = require('./lib/errors');
var spawnSync = require('child_process').spawnSync;

var preFlightCheck = spawnSync('ffprobe', ['-version']).error === undefined;

module.exports = function(source) {
	if (!preFlightCheck) {
		throw new Error(pluginErrors.preflightError);
	}
	return 'module.exports = {};';
};

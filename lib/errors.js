'use strict';

var pluginName = 'webpack-audio-sprite-loader';

function format(errMsg) {
	return pluginName + ': ' + errMsg;
}

module.exports = {
	preflightError: format('ffprobe and ffmpeg must be locally installed.' +
		' @see: https://www.ffmpeg.org'),
	probeError: format('unable to read file format information using ffprobe.'),
  audioModuleInstantiationError: format('You must pass the resourcePath' +
    ' configuration property to instantiate an AudioModule')
};

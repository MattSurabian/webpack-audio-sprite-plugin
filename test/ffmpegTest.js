/* globals describe afterEach before */
'use strict';

var fs = require('fs');
var path = require('path');
var ffmpegLib = '../lib/ffmpeg';
var expect = require('chai').expect;

var UnexpectedError = require('./fixtures/unexpectedError');
var expectedThudFileInfo = require('./fixtures/thudInfo');

var originalPath = process.env.PATH;

describe('preflight check', function() {

  before(function() {
    fs.chmodSync(path.join(__dirname, 'mocks', 'ffprobe'), '0755');
  });

  afterEach(function() {
    delete require.cache[require.resolve(ffmpegLib)];
    process.env.PATH = originalPath;
  });

  it('Throws an error if ffprobe can\'t be found in PATH', function() {
    process.env.PATH = '';
    var ffmpeg = require(ffmpegLib);
    expect(ffmpeg.preFlightCheck).to.throw(Error);
  });

  it('Doesn\'t throw an error if ffprobe is found in PATH', function() {
    process.env.PATH = path.join(__dirname, 'mocks');
    var ffmpeg = require(ffmpegLib);
    expect(ffmpeg.preFlightCheck).not.to.throw(Error);
  });

  it('Completes the actual preflight check only on first load', function() {
    process.env.PATH = '';
    var ffmpeg = require(ffmpegLib);
    expect(ffmpeg.preFlightCheck).to.throw(Error);
    process.env.PATH = path.join(__dirname, 'mocks');
    expect(ffmpeg.preFlightCheck).to.throw(Error);
  });
});

describe('get info', function() {
  var ffmpeg;

  beforeEach(function() {
    ffmpeg = require(ffmpegLib);
  });

  it('returns a promise in asynchronous mode', function(done) {
    var fileInfoPromise = ffmpeg.getFileInfo(path.join(__dirname, 'fixtures', 'thud.mp3'));
    expect(fileInfoPromise).to.be.an.instanceOf(Promise);
    fileInfoPromise.then(function(response) {
      expect(response).to.deep.equal(expectedThudFileInfo);
      done();
    });
  });

  it('returns an object in synchronous mode', function() {
    var fileInfo = ffmpeg.getFileInfoSync(path.join(__dirname, 'fixtures', 'thud.mp3'));
    expect(fileInfo).to.deep.equal(expectedThudFileInfo)
  });
  
  it('throws errors in synchronous mode on missing resource', function() {
    var getInfo = ffmpeg.getFileInfoSync.bind(null, (path.join(__dirname, 'fixtures', 'thudz.mp3')));
    expect(getInfo).to.throw(Error);
  });

  it('rejects promises in asynch mode on missing resource', function(done) {
    ffmpeg.getFileInfo(path.join(__dirname, 'fixtures', 'thudz.mp3'))
      .then(function() {
        throw new UnexpectedError('should not be thrown');
      })
      .catch(function(err) {
        expect(err).to.not.be.an.instanceOf(UnexpectedError);
        done();
      })
  });
  
  it('throws errors in synchronous mode on corrupt resource', function(){
    var getInfo = ffmpeg.getFileInfoSync.bind(null, (path.join(__dirname, 'fixtures', 'corrupt.mp3')));
    expect(getInfo).to.throw(Error);
  });

  it('rejects promises in asynch mode on corrupt resource', function(done) {
    ffmpeg.getFileInfo(path.join(__dirname, 'fixtures', 'corrupt.mp3'))
      .then(function() {
        throw new UnexpectedError('should not be thrown');
      })
      .catch(function(err) {
        expect(err).to.not.be.an.instanceOf(UnexpectedError);
        done();
      })
  });
});

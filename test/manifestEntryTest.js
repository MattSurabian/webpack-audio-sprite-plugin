/* globals describe afterEach before */
'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var thudFileInfo = require('./fixtures/thudInfo');
var quackFileInfo = require('./fixtures/quackInfo');
var getManifestEntryModule = require('./fixtures/manifestEntryModule');
var thudExpectedModule = getManifestEntryModule('thud.mp3', thudFileInfo, './thud.json');
var quackExpectedModule = getManifestEntryModule('quack.mp3', quackFileInfo);
var getLoaderContext = require('./fixtures/loaderContext');
var thudLoaderContext = getLoaderContext('thud.mp3');
var quackLoaderContext = getLoaderContext('quack.mp3');

var ManifestEntry = require('../lib/manifestEntry');

describe('manifest entry', function() {

  it('Returns a new instance when called without new operator', function() {
    var thudEntry = ManifestEntry(thudLoaderContext, thudFileInfo);
    var thudEntryNew = new ManifestEntry(thudLoaderContext, thudFileInfo);
    expect(thudEntry).to.be.an.instanceOf(ManifestEntry);
    expect(thudEntry).to.deep.equal(thudEntryNew);
  });

  it('Utilizes the metadata query param correctly', function() {
    var thudLoaderContextWithQuery = getLoaderContext('thud.mp3', '?metadata=[name].yaml');
    var thudEntry = ManifestEntry(thudLoaderContextWithQuery, thudFileInfo);
    expect(thudEntry.metadataFilePath).to.equal(path.join(thudLoaderContextWithQuery.context, 'thud.yaml'));
  });
  
  it('Generates the correct module in sync mode', function() {
    var thudManifestEntry = new ManifestEntry(thudLoaderContext, thudFileInfo).getModuleSync();
    expect(thudManifestEntry).to.deep.equal(thudExpectedModule);
    
    var quackManifestEntry = new ManifestEntry(quackLoaderContext, quackFileInfo).getModuleSync();
    expect(quackManifestEntry).to.deep.equal(quackExpectedModule);
  });

  it('Generates the correct module in async mode', function(done) {
    ManifestEntry(thudLoaderContext, thudFileInfo).getModule()
      .then(function(thudManifestEntry) {
        expect(thudManifestEntry).to.deep.equal(thudExpectedModule);
      })
      .then(function() {
        return ManifestEntry(quackLoaderContext, quackFileInfo).getModule()
      })
      .then(function(quackManifestEntry) {
        expect(quackManifestEntry).to.deep.equal(quackExpectedModule);
        done();
      })
  });
  
});

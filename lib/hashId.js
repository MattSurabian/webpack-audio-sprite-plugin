'use strict';

var crypto = require('crypto');
var saltLength = 10;
var defaultPrefix = 'audio_sprite_plugin_';

/**
 * None of these methdds are meant to be cryptographically secure. These
 * hashing methods should only be used to generate unique identifiers in
 * either a deterministic or non-deterministic way.
 */
module.exports = {
  /**
   * Generates a predictable hash of length 40 characters for a given input
   * @param value
   * @param prefix
   * @returns {*}
   */
  deterministic: function(value, prefix) {
    if (!prefix) {
      prefix = defaultPrefix;
    }
    return prefix + crypto.createHash('sha1').update(String(value)).digest('hex');
  },
  /**
   * Generates a random hash of length 40 characters for a given input.
   * Random output is achieved using a new randomly generated salt on each run.
   * @param value
   * @param prefix
   * @returns {*}
   */
  nonDeterministic: function(value, prefix) {
    if (!prefix) {
      prefix = defaultPrefix;
    }
    var salt = crypto.randomBytes(saltLength).toString('ascii');
    return prefix + crypto.createHash('sha1').update(salt + String(value)).digest('hex');
  }
};

const jshint = require('../lib/jshint-2.11.1/jshint.js')

/**
 * Performs static analysis on code 
 * @param {string} code source code 
 * @return {Object} metrics
 */

function analyze(code) {
  jshint.JSHINT(code);
  result = jshint.JSHINT.data();
  
  // Get total complexity from result object
  complexity = result.functions
    .map(item => item.metrics.complexity)
    .reduce((acc, curr) => acc + curr, 0);
  return {'complexity': complexity};
}

module.exports = analyze;
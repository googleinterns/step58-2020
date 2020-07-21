const escomplex = require('escomplex');

/**
 * Performs static analysis on code 
 * @param {string} code source code 
 * @return {Object} metrics
 */

function analyze(code) {
  const result = escomplex.analyse(code);

  // Round to 3 decimal places if needed
  roundedDifficulty = +(result.aggregate.halstead.difficulty.toFixed(3));
  return {
    cyclomatic: result.aggregate.cyclomatic,
    lloc: result.aggregate.sloc.logical,
    difficulty: roundedDifficulty
  };
}

module.exports = analyze;
const escomplex = require('escomplex');

/**
 * Performs static analysis on code 
 * @param {string} code source code 
 * @return {Object} metrics
 */

function analyze(code) {
  const result = escomplex.analyse(code);

  // Round to 3 decimal places if needed
  roundedDensity = +(result.aggregate.cyclomaticDensity.tofixed(3));
  roundedDifficulty = +(result.aggregate.halstead.difficulty.toFixed(3));
  return {
    cyclomatic: result.aggregate.cyclomatic,
    lloc: result.aggregate.sloc.logical,
    difficulty: roundedDifficulty,
    ploc: result.aggregate.sloc.physical,
    params: result.aggregate.params,
    density: roundedDensity
  };
}

module.exports = analyze;
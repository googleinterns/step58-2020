const escomplex = require('escomplex');
const instrument = require('./instrument_code.js');
const ASSERT_CALL_NAME = 'assert';
/**
 * Performs static analysis on code 
 * @param {string} code source code 
 * @return {Object} metrics
 */

function analyze(code) {
  code = instrument.removeCalls(code, ASSERT_CALL_NAME);
  const result = escomplex.analyse(code);

  // Round to 3 decimal places if needed
  roundedDensity = +(result.aggregate.cyclomaticDensity.toFixed(3));
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
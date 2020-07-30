/**
 * Module that provides the ability to run JavaScript in a sandbox.
 * This module creates a child process, captures its stdout and stderr,
 * then returns an object containing both.
 *
 *
 * Notes on capturing stdout / stderr design:
 * This design is used due to the nature of the interpreter sandboxing.
 * I originally intended to capture the stdout and stderr by passing an object
 * from outside of the sandbox to inside.
 * The sandboxed environment can then pass informations by modifying said object.
 *
 * However, the sandboxing library prevents this from happening.
 * Any objects created and passed to the sandboxed environment will be deep-copied
 * when we pass the object with seemingly no way to get it out except than to
 * rewrite and overwrite functions declared in the library.
 *
 * Relaying information by printing to stdout and stderr directly, however,
 * works completely fine. It seems like this is because the libary doesn't
 * make a new stream for every file descriptor it receives, unlike objects.
 *
 *
 * Notes on manager / worker design:
 * The manager / worker design is chosen as it provides useful abstractions
 * and advantages over a monolithic module that just runs the interpreter:
 * - By spawning a child worker process, we can better manage each sandboxed
 *   unit and enforce restrictions such as runtime limit. If we don't spawn
 *   a child worker, we have to work around the nature of the sandbox such as
 *   only being able to prevent infinite loop from hogging resources by
 *   setting a timeout, which is considerably slow.
 *
 * - Should other languages be supported in the future, this design can adapt
 *   to support them pretty well. For example, this module can be modified
 *   such that it acts as a composer for docker container which could run
 *   different languages.
 *
 * - This design is more adaptable should there be design changes in the future.
 *   For example, should there be a need to do code queueing in the future,
 *   we can modify this manager to act as a publisher and its worker to acts
 *   as consumers.
 *
 **/
const child         = require('child_process');
const path          = require('path'); 
const util          = require('util');
const execFile      = util.promisify(require('child_process').execFile);

const codeInstrumenter  = require('./instrument_code.js');

const CHILD_SCRIPT      = path.join(__dirname, 'code_sandbox_worker.js');
const DEFAULT_TIMEOUT   = 1500;
const FULL_COVERAGE     = 100;

async function run(code, timeout, doInstrumentation) {
  // Sets a timeout (in milliseconds) if given, uses DEFAULT_TIMEOUT otherwise.
  let execOption    = {
    timeout: timeout || DEFAULT_TIMEOUT
  };

  // Returns promise of child process to prevent blocking.
  // Also uses execFile rather than exec to prevent shell process
  // from spawning, making this execution more efficient.
  try {
    return await execFile(CHILD_SCRIPT, [code, doInstrumentation], execOption);
  } catch (error) {
    return error;
  }
}

async function calculateCodeCoverage(code, timeout) {
  const instrumentationResult = codeInstrumenter.generateInstrumentedCode(code);
  const instrumentedCode = instrumentationResult.code;
  const totalStatementCount = instrumentationResult.totalStatementCount;

  const executionResult = await run(instrumentedCode, null, true);
  const executedStatement = parseFloat(executionResult.stdout);

  const statementCoverage = executedStatement / totalStatementCount * FULL_COVERAGE;

  // We get NaN if totalStatementCount is 0, in which case we return
  // 100 percent coverage by default.
  if (isNaN(statementCoverage)) {
    return FULL_COVERAGE;
  }

  return statementCoverage;
}

module.exports = {
  run: run,
  calculateCodeCoverage: calculateCodeCoverage,
};

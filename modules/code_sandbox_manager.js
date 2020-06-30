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

const CHILD_SCRIPT      = path.join(__dirname, 'code_sandbox_worker.js');
const DEFAULT_TIMEOUT   = 1500;

function run(code, timeout) {
  // Passes in code through stdin of child process.
  // Also prevents child process from printing to console.
  // Sets a timeout (in milliseconds) if given, uses DEFAULT_TIMEOUT otherwise
  let childCommand  = 'node ' + CHILD_SCRIPT;
  let execOption    = {
    'input': code, 
    'stdio': 'pipe', 
    'timeout': timeout || DEFAULT_TIMEOUT
  };

  let childStdout;
  let childStderr;
  let childSignal;

  // Captures the child process' stdout, stderr, and signal when terminated
  // and returns it to the caller.
  try {
    childStdout = child.execSync(childCommand, execOption).toString();
  } catch (error) {
    childStdout = error.stdout.toString();
    childStderr = error.stderr.toString();
    childSignal = error.signal;
  }

  return {
    stdout: childStdout,
    stderr: childStderr,
    signal: childSignal
  };
}

module.exports.run = run;

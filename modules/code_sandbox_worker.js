/**
* Worker script that runs a JavaScript code inside a sandbox.
*
* This script doesn't attempt to capture any errors or
* prevent mishaps such as infinite loop as they will be handled by the manager.
*
* Instead, the focus is to just run the sandboxed code as efficiently as possible. 
**/
global.acorn            = require('../lib/js_interpreter/acorn_interpreter.js');
const acornInterpreter  = require('../lib/js_interpreter/acorn_interpreter.js');
const fs                = require('fs');


/**
 * Function to override functions call inside the sandbox interpreter.
 * This function serves as an interface between the server node runtime and the sandbox.
 * 
 * By overriding alert() in the sandbox for example, we can modify alert()
 * so that its result can be redirected to console.log() in the server node runtime.
 **/
var overrideFunctions = function(interpreter, scope) {
  let alertOverride = function(text) {
    console.log(text);
  };

  let assertOverride = function(isTrue, message) {
    if (!isTrue) {
      throw (message || "Assertion failed");
    }
  }

  interpreter.setProperty(scope, 'alert', 
    interpreter.createNativeFunction(alertOverride));
  interpreter.setProperty(scope, 'assert', 
    interpreter.createNativeFunction(assertOverride));
}


// Receives code from stdin, and execute it.
let code = fs.readFileSync(0, 'utf-8');
interpreter = new acornInterpreter.Interpreter(code, overrideFunctions);
while(interpreter.step());

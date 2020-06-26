const CODE_AREA_ID      = 'code-area';
const CODE_OUTPUT_ID    = 'code-output';
const RUN_BUTTON_ID     = 'run-button';
const STOP_BUTTON_ID    = 'stop-button';
const HIDDEN_ATTRIBUTE  = 'hidden';
const NEWLINE           = '\n';

var codeMirror;
var outputArea;
var runButton;
var stopButton;
var keepRunningCode;


window.addEventListener('load', function() {
  setupCodeMirror();
  setupElements();
});

function setupCodeMirror() {
  codeMirror = CodeMirror(document.getElementById(CODE_AREA_ID), {
    value: 'function myScript(){return 100;}\n',
    mode:  'javascript',
    lineNumbers: true,
  });
}

function setupElements() {
  outputArea    = document.getElementById(CODE_OUTPUT_ID);
  runButton     = document.getElementById(RUN_BUTTON_ID);
  stopButton    = document.getElementById(STOP_BUTTON_ID);
}

function overrideFunctions(interpreter, scope) {
  var alertOverride = function(text) {
    outputArea.innerHTML += text + NEWLINE;
  };

  var assertOverride = function(isTrue, message) {
    if (!isTrue) {
      outputArea.innerHTML += message || "Assertion failed";
      keepRunningCode = false;
      updateButtons();
    }
  }

  interpreter.setProperty(scope, 'alert', 
    interpreter.createNativeFunction(alertOverride));
  interpreter.setProperty(scope, 'assert', 
    interpreter.createNativeFunction(assertOverride));
}

function executeCode() {
  outputArea.innerHTML  = '';
  keepRunningCode       = true;
  updateButtons();

  try {
    let code    = codeMirror.getValue();
    interpreter = new Interpreter(code, overrideFunctions);
    startRunningCode(interpreter); 
  } catch (error) {
    outputArea.innerHTML += error + NEWLINE;
    keepRunningCode = false;
    updateButtons();
  }
}

function updateButtons() {
  if (keepRunningCode) {
    runButton.setAttribute(HIDDEN_ATTRIBUTE, true);
    stopButton.removeAttribute(HIDDEN_ATTRIBUTE);
  } else {
    stopButton.setAttribute(HIDDEN_ATTRIBUTE, true);
    runButton.removeAttribute(HIDDEN_ATTRIBUTE);
  }
}

function startRunningCode(interpreter) {
  function nextStep() {
    if (keepRunningCode && interpreter.step()) {
      setTimeout(nextStep, 0);
    } else {
      keepRunningCode = false;
      updateButtons();
    }
  }
  nextStep();
}

function stopRunningCode() {
  keepRunningCode = false;
  updateButtons();
}

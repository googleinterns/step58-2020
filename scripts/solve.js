const CODE_AREA_ID      = 'code-area';
const CODE_OUTPUT_ID    = 'code-output';
const NEWLINE           = '\n';

var codeMirror;
var outputArea;


window.addEventListener('load', function() {
  codeMirror = CodeMirror(document.getElementById(CODE_AREA_ID), {
    value: 'function myScript(){return 100;}\n',
    mode:  'javascript',
    lineNumbers: true,
  });

  outputArea = document.getElementById(CODE_OUTPUT_ID);
});

function overrideFunctions(interpreter, scope) {
  var alertOverride = function(text) {
    outputArea.innerHTML += text + NEWLINE;
  };

  interpreter.setProperty(scope, 'alert', 
    interpreter.createNativeFunction(alertOverride));
}

function executeCode() {
  let code      = codeMirror.getValue();
  myInterpreter = new Interpreter(code, overrideFunctions);

  myInterpreter.run();
}

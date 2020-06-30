'use strict';

const sampleCode = 'function myScript(){return 100;}\n';

window.addEventListener('load', function() {
  this.console.log("hello!")
  const myCodeMirror = CodeMirror(document.getElementById('code-area'), {
    value: sampleCode,
    mode: 'javascript',
    lineNumbers: true
  });

  runStaticAnalysis(myCodeMirror.getValue());
});

function runStaticAnalysis(code) {
  let totalComplexity = 0;
  JSHINT(code);
  const results = JSHINT.data();
  results.functions.forEach(fn => totalComplexity += fn.metrics.complexity);
  // document.getElementById('analysis-output').innerText = 'The cyclomatic complexity is ' + totalComplexity;
}

angular.module('yellowBrickCode.solve', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/solve', {
    templateUrl: 'html/solve/solve.template.html',
    controller: 'SolveCtrl'
  });
}])

.controller('SolveCtrl', function solveCtrl($scope) {
  
});
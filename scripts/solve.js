const sampleCode = 'function myScript(){return 100;}\n';
window.addEventListener('load', function() {
  var myCodeMirror = CodeMirror(document.getElementById('code-area'), {
    value: sampleCode,
    mode: 'javascript',
    lineNumbers: true
  });

  JSHINT(sampleCode);
  const results = JSHINT.data();
  let totalComplexity = 0;
  results.functions.forEach(fn => totalComplexity += fn.metrics.complexity);
  document.getElementById('analysis-output').innerText = 'The cyclomatic complexity is ' + totalComplexity;
  console.log(JSHINT.data());
});

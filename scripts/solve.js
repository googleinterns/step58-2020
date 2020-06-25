window.addEventListener('load', function() {
  var myCodeMirror = CodeMirror(document.getElementById('code-area'), {
    value: "function myScript(){return 100;}\n",
    mode:  "javascript",
    lineNumbers: true
  });
});

const CODE_AREA_CLASS       = 'code-area';
const COLLAPSE_CLASS        = 'collapse';
const COLLAPSE_AREA_CLASS   = 'collapse-area';

window.addEventListener('load', function() {
  setupCodeArea();
  setupCollapseArea();
});

/**
 * Initializes all text areas into codemirror instances.
 **/
function setupCodeArea() {
  const codeAreas = document.getElementsByClassName(CODE_AREA_CLASS);

  for (let element of codeAreas) {
    const codeMirror = CodeMirror.fromTextArea(element, {
      mode: 'javascript',
      readOnly: true,
      lineNumbers: true,
    });
  }
}

/**
 * Collapses the text areas such that it will only be shown when toggled.
 **/
function setupCollapseArea() {
  const collapseAreas = document.getElementsByClassName(COLLAPSE_AREA_CLASS);

  for (let element of collapseAreas) {
    element.classList.add(COLLAPSE_CLASS);
  }
}

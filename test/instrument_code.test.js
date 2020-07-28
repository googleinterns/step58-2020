const codeInstrumenter = require('../modules/instrument_code.js');
const acorn = require('acorn');
const estraverse = require('estraverse');
const escodegen = require('escodegen');
const assert = require('assert');

/**
* Helper function to delete all whitespaces in code
* including space characters, tab spaces, and newlines.
*
* Used in testing as we don't expect the instrumented code
* to properly follow all indentation rules.
**/
function stripSpace(code) {
  return code.replace(/\s/g,'');
}

/**
* Helper function to generate instrumented code.
* Takes in a code and an instrumentFunction.
*
* An abstract syntax tree representing the code will be generated.
* The syntax tree will then be traveled node by node, where
* each node will be replaced with the node returned by the instrumentFunction.
* After the traversal ends, a generated code is returned.
**/
function instrumentCode(originalCode, instrumentFunction) {
  let codeAst = acorn.parse(originalCode);

  estraverse.replace(codeAst, {
    leave: function (node, parent) {
      return instrumentFunction(node, parent);
    }
  });

  return escodegen.generate(codeAst);
}

describe('Code Instrumentation module', () => {
  describe('wrapInBlockStatement()', () => {
    it('should handle simple single-liners properly', () => {
      const originalCode = `
      if (1 == 1)
        var x = 2;
      else
        var y = 1;

      for (var i = 0; i < 12; i++)
        doTask();

      while (true)
        var z = 3;
      `;

      const expectedCode = `
      if (1 == 1) {
        var x = 2;
      } else {
        var y = 1;
      }

      for (var i = 0; i < 12; i++) {
        doTask();
      }

      while (true) {
        var z = 3;
      }
      `;

      const generatedCode = 
        instrumentCode(originalCode, codeInstrumenter.wrapInBlockStatement);

      assert.equal(stripSpace(expectedCode), stripSpace(generatedCode));
    });


    it('should only wrap the first statement in a single-liner', () => {
      const originalCode = `
      if (1 == 1) var x = 2; var z = 3;
      `;

      const expectedCode = `
      if (1 == 1) {
        var x = 2;
      } 
      var z = 3;
      `;

      const generatedCode = 
        instrumentCode(originalCode, codeInstrumenter.wrapInBlockStatement);

      assert.equal(stripSpace(expectedCode), stripSpace(generatedCode));
    });

    it('should only wrap statements when needed', () => {
      const originalCode = `
      if (1 == 1) {
        var x = 2;
      } 

      if (1 == 2)
        var z = 3;
      `;

      const expectedCode = `
      if (1 == 1) {
        var x = 2;
      } 

      if (1 == 2) {
        var z = 3;
      }
      `;

      const generatedCode = 
        instrumentCode(originalCode, codeInstrumenter.wrapInBlockStatement);

      assert.equal(stripSpace(expectedCode), stripSpace(generatedCode));
    });
  });
});

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

  describe('addStatementCoverageDetection()', () => {
    it('add instrumentation functions before a statement rather than after', () => {
      const originalCode = `
      function solution() {
        return 1;
      }
      `;

      const expectedCode = `
      function solution() {
        coverageReport.recordExecutedStatement(37);
        return 1;
      }
      `;

      const generatedCode = 
        instrumentCode(originalCode, codeInstrumenter.addStatementCoverageDetection);

      assert.equal(stripSpace(expectedCode), stripSpace(generatedCode));
    });

    it('should not be affected by multiple statements in one line', () => {
      const originalCode = `
      function solution() {
        var x = 1; return x;
      }
      `;

      const expectedCode = `
      function solution() {
        coverageReport.recordExecutedStatement(37);
        var x = 1;

        coverageReport.recordExecutedStatement(48);
        return x;
      }
      `;

      const generatedCode = 
        instrumentCode(originalCode, codeInstrumenter.addStatementCoverageDetection);

      assert.equal(stripSpace(expectedCode), stripSpace(generatedCode));
    });

    it('should generate instrumented functions with unique arguments', () => {
      const originalCode = `
      function solution() {
        var x = 1;
        x = 2;
        x = 3;
        
        return x;
      }
      `;

      const expectedCode = `
      function solution() {
        coverageReport.recordExecutedStatement(37);
        var x = 1;
        coverageReport.recordExecutedStatement(56);
        x = 2;
        coverageReport.recordExecutedStatement(71);
        x = 3;

        coverageReport.recordExecutedStatement(95);
        return x;
      }
      `;

      const generatedCode = 
        instrumentCode(originalCode, codeInstrumenter.addStatementCoverageDetection);

      assert.equal(stripSpace(expectedCode), stripSpace(generatedCode));
    });
  });

  describe('generateInstrumentedCode()', () => {
    it('should generate code that includes the instrumentation header', () => {
      const code = `
      function solve() {
        return 1;
      }
      `;

      const instrumentationResult = codeInstrumenter.generateInstrumentedCode(code);
      const instrumentedCode = instrumentationResult.code;

      assert.ok(instrumentedCode.includes(codeInstrumenter.INSTRUMENTATION_HEADER));
    });

    it('should generate code that includes the instrumentation footer', () => {
      const code = `
      function solve() {
        return 1;
      }
      `;

      const instrumentationResult = codeInstrumenter.generateInstrumentedCode(code);
      const instrumentedCode = instrumentationResult.code;

      assert.ok(instrumentedCode.includes(codeInstrumenter.INSTRUMENTATION_FOOTER));
    });

    it('should handle one-liner statements properly', () => {
      const code = `
      function solve() {
        if (true)
          doThis(); doThat();

        return 1;
      }
      `;

      const expectedCode = `
      ${codeInstrumenter.INSTRUMENTATION_HEADER}
      function solve() {
        coverageReport.recordExecutedStatement(34);
        if (true) {
          coverageReport.recordExecutedStatement(54);
          doThis();
        }

        coverageReport.recordExecutedStatement(64);
        doThat();

        coverageReport.recordExecutedStatement(83);
        return 1;
      }
      ${codeInstrumenter.INSTRUMENTATION_FOOTER}
      `;

      const expectedStatementCount = 4;

      const instrumentationResult = codeInstrumenter.generateInstrumentedCode(code);
      const instrumentedCode = instrumentationResult.code;
      const totalStatementCount = instrumentationResult.totalStatementCount;

      assert.equal(stripSpace(expectedCode), stripSpace(instrumentedCode));
      assert.equal(expectedStatementCount, totalStatementCount);
    });
  });
});

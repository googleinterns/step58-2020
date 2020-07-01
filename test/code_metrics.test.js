const analyze = require('../modules/code_metrics.js')
const assert = require('assert');

describe('Code Metrics Analyzer', function() {
  describe('Cyclomatic complexity', function() {
    it('should output the correct complexity number', function() {
      const sourceCode = `function test() {
                            if (3*2 === 6) {
                              alert("3*2 is 6")
                            }
                            else {
                              alert("panic")
                            }
                          }`
      const result = analyze(sourceCode);
      const expected = 2;
      assert.strictEqual(result.complexity, expected);
    });
  });
});
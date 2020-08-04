const analyze = require('../modules/code_metrics.js')
const assert = require('assert');

describe('Code Metrics Analyzer', function() {
  describe('Cyclomatic complexity', function() {
    it('should output the correct complexity number', function() {
      const sourceCode = `function test() {
                            if (3*2 === 6) {
                              alert("3*2 is 6");
                            }
                            else {
                              alert("panic");
                            }
                          }`
      const result = analyze(sourceCode);
      const expected = 2;
      assert.strictEqual(result.cyclomatic, expected);
    });
  });

  describe('Logical lines of code', function() {
    it('should output the correct logical lines of code', function() {
      const sourceCode = `function test() {
        var hello = 5
        assert(hello === 5);
        assert();
      }`
      const result = analyze(sourceCode);
      const expected = 2;
      assert.strictEqual(result.lloc, expected);
    });
  });

  describe('Difficulty', function() {
    it('should output the correct logical lines of code', function() {
      const sourceCode = `function test() {
        var hello = 5
        assert(hello === 5);
        assert();
      }`
      const result = analyze(sourceCode);
      const expected = 1.5;
      assert.strictEqual(result.difficulty, expected);
    });
  });
});

const sandbox = require('../modules/code_sandbox_manager.js');
const assert = require('assert');

describe('Code Sandbox', function () {
  describe('alert()', function () {
    it(`should be connected to sandbox host's stdout`, function () {
      const code      = `alert('Hello there!');`;
      const result    = sandbox.run(code);

      assert.equal(result.stdout, 'Hello there!\n');
    });
  });

  describe('alert()', function () {
    it(`should be connected to sandbox host's stderr`, function () {
      const code      = `assert(false);`;
      const result    = sandbox.run(code);

      assert.ok(result.stderr.includes('Assertion failed\n'));
    });

    it(`should be able to display custom message`, function () {
      const code      = `assert(false, 'Something went wrong');`;
      const result    = sandbox.run(code);

      assert.ok(result.stderr.includes('Something went wrong\n'));
    });

    it(`should stop program on first false assertion`, function () {
      const code = `
      alert(1);
      assert(true);
      alert(2);
      assert(false);
      alert(3);
      `;

      const result = sandbox.run(code);

      assert.ok(result.stderr.includes('Assertion failed\n'));
      assert.equal(result.stdout, '1\n2\n');
    });
  });


  describe('interpreter', function () {
    it(`should detect invalid JavaScript syntax`, function () {
      const code = `
      package main
      import "fmt"

      func main() {
        fmt.Println("hello world")
      }
      `;

      const result = sandbox.run(code);

      assert.ok(result.stderr.includes('SyntaxError: Unexpected token (2:14)'));
    });

    it(`should detect undeclared function reference`, function () {
      const code = `alert(go());`;
      const result = sandbox.run(code);

      assert.ok(result.stderr.includes('ReferenceError: go is not defined'));
    });

    it(`should detect undeclared variable reference`, function () {
      const code = `alert(str);`;
      const result = sandbox.run(code);

      assert.ok(result.stderr.includes('ReferenceError: str is not defined'));
    });
  });

  describe('timeout', function () {
    it(`should prevent infinite loop given a timeout argument`, function () {
      const code = `while(true);`;
      const result = sandbox.run(code, 100);

      assert.equal(result.signal, 'SIGTERM');
    });

    it(`should use default timeout when not given an explicit argument`, function () {
      const code = `while(true);`;
      const result = sandbox.run(code);

      assert.equal(result.signal, 'SIGTERM');
    });
  });
});


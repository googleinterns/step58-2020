const sandbox = require('../modules/code_sandbox_manager.js');
const assert = require('assert');

describe('Code Sandbox', async() => {
  describe('alert()', async() => {
    it(`should be connected to sandbox host's stdout`, async() => {
      const code      = `alert('Hello there!');`;
      const result    = await sandbox.run(code);

      assert.equal(result.stdout, 'Hello there!\n');
    });
  });

  describe('alert()', async() => {
    it(`should be connected to sandbox host's stderr`, async() => {
      const code      = `assert(false);`;
      const result    = await sandbox.run(code);

      assert.ok(result.stderr.includes('Assertion failed\n'));
    });

    it(`should be able to display custom message`, async() => {
      const code      = `assert(false, 'Something went wrong');`;
      const result    = await sandbox.run(code);

      assert.ok(result.stderr.includes('Something went wrong\n'));
    });

    it(`should stop program on first false assertion`, async() => {
      const code = `
      alert(1);
      assert(true);
      alert(2);
      assert(false);
      alert(3);
      `;

      const result = await sandbox.run(code);

      assert.ok(result.stderr.includes('Assertion failed\n'));
      assert.equal(result.stdout, '1\n2\n');
    });
  });


  describe('interpreter', async() => {
    it(`should detect invalid JavaScript syntax`, async() => {
      const code = `
      package main
      import "fmt"

      func main() {
        fmt.Println("hello world")
      }
      `;

      const result = await sandbox.run(code);

      assert.ok(result.stderr.includes('SyntaxError: Unexpected token (2:14)'));
    });

    it(`should detect undeclared function reference`, async() => {
      const code = `alert(go());`;
      const result = await sandbox.run(code);

      assert.ok(result.stderr.includes('ReferenceError: go is not defined'));
    });

    it(`should detect undeclared variable reference`, async() => {
      const code = `alert(str);`;
      const result = await sandbox.run(code);

      assert.ok(result.stderr.includes('ReferenceError: str is not defined'));
    });
  });

  describe('timeout', async() => {
    it(`should prevent infinite loop given a timeout argument`, async() => {
      const code = `while(true);`;
      const result = await sandbox.run(code, 100);

      assert.equal(result.signal, 'SIGTERM');
    });

    it(`should use default timeout when not given an explicit argument`, async() => {
      const code = `while(true);`;
      const result = await sandbox.run(code);

      assert.equal(result.signal, 'SIGTERM');
    });
  });
});


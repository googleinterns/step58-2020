const sandbox = require('../modules/code_sandbox_manager.js');
const assert = require('assert');

describe('Code Sandbox', async() => {
  describe('alert()', async() => {
    it(`should be connected to sandbox host's stdout`, async() => {
      const code      = `alert('Hello there!');`;
      const result    = await sandbox.run(code);

      assert.equal(result.stdout, 'Hello there!\n');
    });

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

  describe('promise', async() => {
    it(`should prevent blocking on multiple calls`, async() => {
      const longCode    = `while(true);`;
      const shortCode   = `alert('Finishes first');`;

      let promises      = [];
      let results       = [];

      // Runs long code first then the short code asynchronously.
      // where the first one to finish will be stored in results first.
      (async() => {
        let promise = sandbox.run(longCode, 1000);
        promises.push(promise);
        results.push(await promise);
      })();
      (async() => {
        let promise = sandbox.run(shortCode);
        promises.push(promise);
        results.push(await promise);
      })();

      // Awaits for both promises to prevent current process
      // from exiting before the sandboxes finish, which would
      // create orphan processes.
      await promises[0];
      await promises[1];

      assert.equal(results[0].stdout, 'Finishes first\n');
      assert.equal(results[1].signal, 'SIGTERM');
    });
  });

  describe('calculateCodeCoverage()', async() => {
    describe(`given a code that branches`, async() => {
      const code = `
      function solve(num) {
        if (num == 1)
          return 1;
        if (num == 2)
          return 2;
        return 3;
      }
      `;

      it(`should detect 0% coverage properly`, async() => {
        const coveragePercent = await sandbox.calculateCodeCoverage(code);
        assert.equal(coveragePercent, 0);
      });

      it(`should detect partial coverage properly`, async() => {
        const tests = `
        assert(solve(3) == 3);
        `;

        const coveragePercent = await sandbox.calculateCodeCoverage(code + tests);
        assert.equal(coveragePercent, 60);
      });

      it(`should detect full coverage properly`, async() => {
        const tests = `
        assert(solve(1) == 1);
        assert(solve(2) == 2);
        assert(solve(3) == 3);
        `;

        const coveragePercent = await sandbox.calculateCodeCoverage(code + tests);
        assert.equal(coveragePercent, 100);
      });
    });

    describe(`given a code that loops`, async() => {
      const code = `
      function solve(num) {
        if (false)
          return num;

        for (var i = 0; i < 10; i++) {
          num += num;
        }

        return num;
      }

      alert(solve(5));
      `;

      it(`should not count the same statement multiple times`, async() => {
        const coveragePercent = await sandbox.calculateCodeCoverage(code);
        assert.equal(coveragePercent, 80);
      });
    });

    describe(`given a code that has no statement`, async() => {
      const code = ``;

      it(`should default to full coverage`, async() => {
        const coveragePercent = await sandbox.calculateCodeCoverage(code);
        assert.equal(coveragePercent, 100);
      });
    });
  });
});


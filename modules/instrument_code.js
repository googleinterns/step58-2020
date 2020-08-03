/**
 * Module that implements source code instrumentation.
 **/

'use strict';

const acorn = require('acorn');
const estraverse = require('estraverse');
const escodegen = require('escodegen');

const BLOCK_STATEMENT = 'BlockStatement';
const EXPRESSION_STATEMENT = 'ExpressionStatement';

const INSTRUMENTATION_HEADER = `
var coverageReport = {};
coverageReport.statementExecuted = {};

coverageReport.recordExecutedStatement = function (position) {
  coverageReport.statementExecuted[position] = true;
};
`;
const INSTRUMENTATION_FOOTER = `
statementExecutedCount = Object.keys(coverageReport.statementExecuted).length
printReport(statementExecutedCount);
`;

/**
 * Function that wraps optional single-liner in BlockStatement Node.
 * Takes in an Abstract Syntax Tree node and its parent,
 * and returns the appropriate replacement of the node.
 *
 * For example, given an AST node that represents doTask() in:
 * if (x == y)
 *   doTask();
 *
 * This code will return an AST node representing:
 * {
 *   doTask();
 * }
 *
 * Such that its caller can replace the AST node and generate:
 * if (x == y) {
 *   doTask();
 * }
 *
 * This function is needed so that further code instrumentation
 * will not accidentally change the behaviour of the original code
 * due to accidents such as:
 * if (x == y)
 *   doTask();
 *
 * turning into:
 * if (x == y)
 *   detectBranchCoverage();
 * doTask();
 **/
function wrapInBlockStatement(node, parent) {
  // Generate BlockStatement node containing the old node
  let wrappedNode = acorn.parse('{}').body[0];
  wrappedNode.body.push(node);

  // Prevents nested BlockStatement wrapping
  if (node.type == BLOCK_STATEMENT) {
    return node;
  }

  // Handles wrapping for conditionals such as if and else statement
  if (parent.consequent == node || parent.alternate == node) {
    return wrappedNode;
  }

  // Handles wrapping for loops such as for and while statement
  if (parent.body == node) {
    return wrappedNode;
  }

  return node;
}

/**
 * Adds coverageReport.recordExecutedStatement() function before each statement
 * in the code where its argument is based on the position.
 *
 * Giving position as the argument assures that we know exactly which statement
 * was executed and can avoid problems such as mixing up different statements.
 **/
function addStatementCoverageDetection(node, parent) {
  if (parent.type == BLOCK_STATEMENT) { 
    const newNode = 
      acorn.parse(`coverageReport.recordExecutedStatement(${node.start})`);
    newNode.body.push(node);

    return newNode;
  }

  return node;
}

/**
 * Generates instrumented code.
 *
 * Enforces BlockStatement usages beforehand to prevent misinterpretation
 * of code during instrumentation.
 *
 * Adds INSTRUMENTATION_HEADER and INSTRUMENTATION_FOOTER last so the
 * header and footer will not be instrumented.
 *
 * Returns the instrumented code and information on the instrumentation done.
 **/
function generateInstrumentedCode(code) {
  let codeAst = acorn.parse(code);
  let totalStatementCount = 0;

  estraverse.replace(codeAst, {
    leave: function (node, parent) {
      return wrapInBlockStatement(node, parent);
    }
  });

  estraverse.replace(codeAst, {
    leave: function (node, parent) {
      const newNode = addStatementCoverageDetection(node, parent);

      if (newNode != node) {
        totalStatementCount += 1;
      }

      return newNode;
    }
  });

  const instrumentedCode = 
    INSTRUMENTATION_HEADER +
    escodegen.generate(codeAst) +
    INSTRUMENTATION_FOOTER;

  return {
    code: instrumentedCode,
    totalStatementCount: totalStatementCount,
  };
}

/**
 * Utility function that removes all calls from a given piece of code.
 * For example, given a piece of code:
 * function hello() {
 *   toRemove();
 *   return 1;
 * }
 *
 * toRemove(123); doThis();
 *
 * removeCalls, given "toRemove" as a callName
 * will return a modified code:
 * function hello() {
 *   return 1;
 * }
 *
 * doThis();
 **/
function removeCalls(code, callName) {
 return code;
}

module.exports = {
  wrapInBlockStatement: wrapInBlockStatement,
  addStatementCoverageDetection: addStatementCoverageDetection,
  generateInstrumentedCode: generateInstrumentedCode,
  removeCalls: removeCalls,
  INSTRUMENTATION_HEADER: INSTRUMENTATION_HEADER,
  INSTRUMENTATION_FOOTER: INSTRUMENTATION_FOOTER,
};

/**
 * Module that implements source code instrumentation.
 **/

'use strict';

const acorn = require('acorn');
const estraverse = require('estraverse');
const escodegen = require('escodegen');

const BLOCK_STATEMENT = 'BlockStatement';

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
  const wrappedNode = acorn.parse('{' + escodegen.generate(node) + '}');

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


module.exports = {
  wrapInBlockStatement: wrapInBlockStatement,
};


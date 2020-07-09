'use strict';

const datastore = require('../modules/datastore.js');

const PROBLEMS_KIND = "Problem";

/**
 * @typedef {Object} Problem
 * @param {number} id
 * @param {string} title
 * @param {string} text
 */
class Problem {
  constructor(id, title, text) {
    this.id = id;
    this.title = title;
    this.text = text;
  }
}

module.exports = function(app) {
  app.get('/problems', async function(request, response) {
    const query = datastore.createQuery(PROBLEMS_KIND);
    const [entities] = await datastore.runQuery(query);
    const problems = entities.map((entity) => {
      return new Problem(entity.id, entity.title, entity.text);
    });
    response.render('problems', {problems: problems});
  });
}
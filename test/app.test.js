const app = require('../app');
const request = require('supertest');

describe('solve_request', () => {
  describe('GET /solve', () => {
    it('should get 200', (done) => {
      request(app).get('/solve').expect(200, done);
    });
  });
});

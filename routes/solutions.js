const analyze = require('../modules/code_metrics.js');
const sandbox = require('../modules/code_sandbox_manager.js');

module.exports = function(app) {
  app.post('/problems/:problemId/solutions', function(req, res) {
    /** TODO (b/160783943)
     * Test code: get problem object from datastore and combine submitted source code with provided
     * test cases. If there are no errors, store as new submission along with analysis and redirect 
     * to updated rankings page. Otherwise, send response with failing test cases so client can alert user.
     **/
    console.log(req.body.code);
    console.log(analyze(req.body.code));
    res.send(false);
  });
}
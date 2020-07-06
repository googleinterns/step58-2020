module.exports = function(app) {
  app.get('/problems/:id', function (request, response) {
    let dynamicContent = {
      'question-title'  : 'Placeholder title for /problems/' + request.params.id,
      'question-text'   : 'Placeholder text for /problems/' + request.params.id,
      'initial-code'    : `alert('Placeholder initial code for /problems/` + request.params.id + `')`
    }

    response.render('solve', dynamicContent);
  });
}

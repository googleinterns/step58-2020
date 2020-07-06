module.exports = function(app) {
  app.get('/problems/:id', function (req, res) {
    res.send(req.params.id);
  });
}

'use strict';

const PORT      = process.env.PORT || 8080;

const path      = require('path'); 
const express   = require('express');
const app       = express();

app.use('/html', express.static(path.join(__dirname, 'html')))
app.use('/scripts', express.static(path.join(__dirname, 'scripts')))
app.use('/lib', express.static(path.join(__dirname, 'lib')))

app.get('/solve', function(request, response){
  response.sendFile('html/solve.html', { root: __dirname });
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
module.exports = app;

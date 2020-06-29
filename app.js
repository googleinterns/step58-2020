//Nick's code
'use strict';

const PORT      = process.env.PORT || 8080;

const path      = require('path'); 
const express   = require('express');
const app       = express();

app.use('/html', express.static(path.join(__dirname, 'html')))
app.use('/scripts', express.static(path.join(__dirname, 'scripts')))
app.use('/stylesheets', express.static(path.join(__dirname, 'stylesheets')))
app.use('/lib', express.static(path.join(__dirname, 'lib')))

app.get('/solve', function(request, response){
  response.sendFile('html/solve.html', { root: __dirname });
});

//This is for the home page
app.get('/', function(request, response){
  response.sendFile('html/home.html', { root: __dirname });
});
//This is for the sign in page
app.get('/sign-in', function(request, response){
  response.sendFile('html/sign-in.html', { root: __dirname });
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
module.exports = app;

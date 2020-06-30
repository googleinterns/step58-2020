'use strict';

const PORT      = process.env.PORT || 8080;

const path      = require('path'); 
const express   = require('express');
const app       = express();

/**
* Responds to requests for routes by giving html files with the same name if possible.
* Ex: Client will get /html/hello.html when sending a request to /hello
**/
app.use('/', express.static(path.join(__dirname, 'html'), {extensions:['html']}));

/**
* Binds the routes /scripts, /stylesheets, and /lib with their corresponding directory.
* Ex: client will get /scripts/hello.js when sending request to /scripts/client.js
**/
app.use('/scripts', express.static(path.join(__dirname, 'scripts')))
app.use('/stylesheets', express.static(path.join(__dirname, 'stylesheets')))
app.use('/lib', express.static(path.join(__dirname, 'lib')))

app.get('/solve', function(request, response){
  response.sendFile('html/solve.html', { root: __dirname });
});

app.get('/', function(request, response){
  response.sendFile('html/home.html', { root: __dirname });
});

app.get('/contact', function(request, response){
  response.sendFile('html/contact.html', { root: __dirname });
});

app.get('/about', function(request, response){
  response.sendFile('html/about.html', { root: __dirname });
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
module.exports = app;
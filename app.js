'use strict';

const PORT      = process.env.PORT || 8080;

const path      = require('path'); 
const express   = require('express');
const bodyParser = require('body-parser');
const exphbs    = require('express-handlebars');
const app       = express();
const userData  = require('./modules/datastore.js');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(express.json());

/**
* Setup express handlebars as our templating engine.
**/
app.engine('hbs', exphbs({defaultLayout: 'main', extname: 'hbs'}));
app.set('views', path.join(__dirname, 'html'));
app.set('view engine', 'hbs');

/**
* Binds the routes /scripts, /stylesheets, and /lib with their corresponding directory.
* Ex: client will get /scripts/hello.js when sending request to /scripts/client.js
**/
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use('/stylesheets', express.static(path.join(__dirname, 'stylesheets')));
app.use('/lib', express.static(path.join(__dirname, 'lib')));

//Handeling GET and POST request in Express
app.post('/user',(request,response) => {
    userData(idToken);
});

//app.post('/storeSubmission')

/**
* Responds to requests for routes by giving html files with the same name if possible.
* Ex: When the route /hello is requested, the server will render the file hello.hbs
**/
app.use('/', function(request, response, next) {
  response.render(request.originalUrl.slice(1));
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
module.exports = app;
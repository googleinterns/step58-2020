'use strict';

const PORT      = process.env.PORT || 8080;

const path      = require('path'); 
const express   = require('express');
const exphbs    = require('express-handlebars');
const fs        = require('fs');
const app       = express();
const cookieParser = require('cookie-parser');

app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

/**
 * Recursively import all route handlers in /routes.
 **/
function importRoutes(dirName) {
  fs.readdirSync(dirName).forEach(function(fileName) {

    let fullName    = path.join(dirName, fileName);
    let stat        = fs.lstatSync(fullName);

    if (stat.isDirectory()) {
      importRoutes(fullName);
    } 

    if (path.extname(fullName) === '.js') {
      require(fullName)(app);
    }
  });
}
importRoutes(path.join(__dirname, 'routes'));

/**
 * Setup express handlebars as our templating engine.
 **/
app.engine('hbs', exphbs({defaultLayout: 'main', extname: 'hbs', helpers: {
  // Helper to do mathematical operations in handlebars
  math: function(firstValue, operator, secondValue) { 
      firstValue  = parseFloat(firstValue);
      secondValue = parseFloat(secondValue);
      return {
          "+": firstValue + secondValue,
          "-": firstValue - secondValue,
          "*": firstValue * secondValue,
          "/": firstValue / secondValue,
          "%": firstValue % secondValue
      }[operator];
    },
  eq: function(arg1, arg2) {
    return arg1 == arg2;
  }
  }
}));
app.set('views', path.join(__dirname, 'html'));
app.set('view engine', 'hbs');

/**
 * Binds the routes /scripts, /stylesheets, and /lib with their corresponding directory.
 * Ex: client will get /scripts/hello.js when sending request to /scripts/client.js
 * Also serves the website icon.
 **/
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use('/stylesheets', express.static(path.join(__dirname, 'stylesheets')));
app.use('/lib', express.static(path.join(__dirname, 'lib')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'html/images/YellowBrickCodeLogo.png')));
app.use('/html/images/YellowBrickCodeLogo.png', express.static(path.join(__dirname, 'html/images/YellowBrickCodeLogo.png')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'html/images/Noogler.jpeg')));
app.use('/html/images/Noogler.jpeg', express.static(path.join(__dirname, 'html/images/Noogler.jpeg')));


/**
 * Responds to requests for routes by giving html files with the same name if possible.
 * Ex: When the route /hello is requested, the server will render the file hello.hbs
 **/
app.use('/', function(request, response, next) {
  response.render(request.originalUrl.slice(1));
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
module.exports = app;

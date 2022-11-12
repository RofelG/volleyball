'use strict';

var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use('/static', express.static('public'));

const checkAuth = function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
  } else {
    next();
  }
}

app.use(checkAuth);

app.get('/login', function(req, res) {
  res.render('pages/login');
});

// index page
app.get('/', function(req, res) {

  // var mascots = [
  //   { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012},
  //   { name: 'Tux', organization: "Linux", birth_year: 1996},
  //   { name: 'Moby Dock', organization: "Docker", birth_year: 2013}
  // ];
  // var tagline = "No programming concept is complete without a cute animal mascot.";

  // res.render('pages/index', {
  //   mascots: mascots,
  //   tagline: tagline
  // });

  res.render('pages/index');
});



// about page
// app.get('/about', function(req, res) {
//   res.render('pages/about');
// });

app.listen(8080);
console.log('Server is listening on port 8080');
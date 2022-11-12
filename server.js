'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import Express
var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

//Connect Database
const con = require('./config/mysql');

//Port Declaration
const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

// allow json data to be passed in the body of requests
app.use(express.json());

app.use('/static', express.static('public'));

app.post('/register', async (req, res) => {
  // Our register logic starts here
  try {
    // Get user input
    const { first, last, email, password } = req.body;

    // Validate user input
    if (!(email && password && first && last)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    // const oldUser = await User.findOne({ email });
    let oldUser = await con.getUser(email);

    if (oldUser != undefined) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    let encryptedPassword = await bcrypt.hash(password, 10);

    let user = await con.createUser([first, last, email, encryptedPassword]);

    // Create token
    const token = jwt.sign(
      { user_id: user, email },
        process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    let output = {
      user_id: user,
      user_first: first,
      user_last: last,
      user_email: email,
      user_password: encryptedPassword,
      token: token
    };

    // return new user
    res.status(201).json(output);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

app.post("/login", async (req, res) => {

  // Our login logic starts here
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    let user = await con.getUser(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user.user_id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      let output = {
        user_id: user.user_id,
        user_first: user.first,
        user_last: user.last,
        user_email: user.email,
        user_password: user.password,
        token: token
      };

      res.status(200).json(output);
    } else {
      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
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

app.listen(port, () => {
  console.log('Server is listening localhost:${port}');
});
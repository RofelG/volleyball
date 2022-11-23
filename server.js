'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

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

//Require Middleware
const auth = require('./middleware/auth');

app.use(cookieParser());

// allow json data to be passed in the body of requests
app.use(express.json());

app.use('/static', express.static('public'));

app.post('/api/register', async (req, res) => {
  try {
    // Get user input
    const { user_first, user_last, user_email, user_password } = req.body;

    // Validate user input
    if (!(user_email && user_password && user_first && user_last)) {
      res.status(400).send("All input is required");
    }

    // Validate if user exist in our database
    let oldUser = await con.getUser(user_email);

    if (oldUser != undefined) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    let salt = crypto.randomBytes(32).toString('hex');
    //Encrypt user password
    let encryptedPassword = await bcrypt.hash(user_password + salt, 10);

    let user = await con.createUser([user_first, user_last, user_email, encryptedPassword, salt]);

    // Create token
    const token = jwt.sign(
      { user_id: user, user_email },
        process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    let output = {
      user_id: user,
      user_first: user_first,
      user_last: user_last,
      user_email: user_email,
      token: token
    };

    // return new user
    res.status(201).json(output);
  } catch (err) {
    console.log(err);
  }
});

app.post("/api/login", async (req, res) => {

  try {
    // Get user input
    const { user_email, user_password } = req.body;

    // Validate user input
    if (!(user_email && user_password)) {
      res.status(400).send("All input is required");
      return;
    }

    let user = await con.getUser(user_email);

    if (user && (await bcrypt.compare(user_password + user.user_salt, user.user_password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user.user_id, user_email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      let output = {
        user_id: user.user_id,
        user_first: user.user_first,
        user_last: user.user_last,
        user_email: user.user_email,
        token: token
      };

      res.cookie('token', token, { httpOnly: true }).status(200).json(output);
    } else {
      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
  }
});

app.get('/api/events/get', async (req, res) => {
  try {
    let output = await con.getEvents(req);
    res.status(200).json(output);
  } catch(err) {
    console.log(err);
  }
});

// app.get('/api/events/get/:id', async (req, res) => {
//   try {
//     let output = await con.getEvent(req);
//     res.status(200).json(output);
//   } catch(err) {
//     console.log(err);
//   }
// });

app.post('/api/events/post', async (req, res) => {
  try {
    // Get user input
    const { cost, date_start, date_end, location, max, name, type, description } = req.body;

    // Validate user input
    if (!(cost && date_start && date_end && location && max && name && type)) {
      res.status(400).send("All input is required");
    }

    let cookie = req.header('Cookie');
    cookie = cookie.split(';');
    let token;
    for (let i = 0; i < cookie.length; i++) {
      if (cookie[i].includes('token')) {
        let temp = cookie[i].split('=');
        token = temp[1];
      }
    }

    let organizer;
    jwt.verify(token, process.env.TOKEN_KEY, async (err, user) => {
      organizer = user.user_id;
    });

    let event = await con.createEvent([cost, date_start, date_end, location, max, name, organizer, type, description]);

    // return new event
    res.status(201).json(event);
  } catch (err) {
    console.log(err);
  }
});

app.post('/api/events/register', async(req, res) => {
  try {
    const { event_id } = req.body;

    let cookie = req.header('Cookie');
    cookie = cookie.split('; ');

    let token;
    for (let i = 0; i < cookie.length; i++) {
      if (cookie[i].includes('token=')) {
        let temp = cookie[i].split('=');
        token = temp[1];
      }
    }

    let userid;

    jwt.verify(token, process.env.TOKEN_KEY, async (err, user) => {
      userid = user.user_id;
    });


    let output = await con.postRegisterEvent([parseInt(userid), parseInt(event_id)]);
    res.status(200).json(output);
  } catch(err) {
    console.log(err);
  }
});

app.get('/api/events/delete', async(req, res) => {
  try {
    const { event_id } = req.query;

    let cookie = req.header('Cookie');
    cookie = cookie.split('; ');

    let token;
    for (let i = 0; i < cookie.length; i++) {
      if (cookie[i].includes('token=')) {
        let temp = cookie[i].split('=');
        token = temp[1];
      }
    }

    let verify = jwt.verify(token, process.env.TOKEN_KEY);

    if (!verify) {
      res.status(400).send('Invalid Token');
    }

    console.log(event_id);
    let output = await con.deleteEvent(event_id);
    res.status(200).json(output);
  } catch(err) {
    console.log(err);
  }
});

app.post('/api/users/names', async(req, res) => {
  try {
    let output = await con.postUserNames(req.body);
    res.status(200).json(output);
  } catch(err) {
    console.log(err);
  }
})

// index page
app.get('/', auth, function(req, res) {
  if (!req.auth) {
    console.log('Not Authenticated');
    res.redirect('/login');
  }

  res.render('pages/index');
});

app.get('/login', function(req, res) {
  res.render('pages/login');
});

app.get('/register', function(req, res) {
  res.render('pages/register');
});

app.listen(port, () => {
  console.log('Server is listening http://localhost:' + port);
});
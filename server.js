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

// Setup Cookie Parser
app.use(cookieParser());

// allow json data to be passed in the body of requests
app.use(express.json());

// Serve Static Files in a virtual directory called static
app.use('/static', express.static('public'));

// API Routes - Public Routes (no authentication required) - Register Route
app.post('/api/register', async (req, res) => {
  try {
    // Get user input
    const { user_first, user_last, user_email, user_password } = req.body;

    // Validate user input
    if (!(user_email && user_password && user_first && user_last)) {
      res.status(400).json({error:"All input is required"});
    }

    // Validate if user exist in our database
    let oldUser = await con.getUser(user_email);

    // If user exist, return error
    if (oldUser != undefined) {
      return res.status(409).json({error:"User Already Exist. Please Login"});
    }

    // Create Salt for password
    let salt = crypto.randomBytes(32).toString('hex');

    // Encrypt user password with salt
    let encryptedPassword = await bcrypt.hash(user_password + salt, 10);

    // Create user in our database with encrypted password
    let user = await con.createUser([user_first, user_last, user_email, encryptedPassword, salt]);

    // Create JWT Token for user authentication and authorization and authorization (expires in 15 minutes)
    const token = jwt.sign(
      { user_id: user, user_email },
        process.env.TOKEN_KEY,
      {
        expiresIn: "15m",
      }
    );

    // Create output object to return to user with token and user information
    let output = {
      user_id: user,
      user_first: user_first,
      user_last: user_last,
      user_email: user_email,
      token: token
    };

    // Return output object to user with status code 201 (Created) and token in cookie header
    res.status(201).json(output);
  } catch (err) {
    console.log(err);
  }
});

// API Routes - Public Routes (no authentication required) - Login Route
app.post("/api/login", async (req, res) => {
  try {
    // Get user input
    const { user_email, user_password } = req.body;

    // Validate user input
    if (!(user_email && user_password)) {
      res.status(400).json({error:"All input is required"});
      return;
    }

    // Validate if user exist in our database
    let cookie = req.header('Cookie');

    let loginCount = 0;
    if (cookie) {
      cookie = cookie.split('; ');

      for (let i = 0; i < cookie.length; i++) {
        if (cookie[i].includes('login=')) {
          let temp = cookie[i].split('=');
          loginCount = temp[1];
        }
      }
    }

    // If login count is greater than 5, return error
    if (loginCount >= 5) {
      res.status(400).json({error:"Too many login attempts. Please try again later."});
      return;
    }

    // Get user from database 
    let user = await con.getUser(user_email);

    // If user exist, compare password with encrypted password in database
    if (user && (await bcrypt.compare(user_password + user.user_salt, user.user_password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user.user_id, user_email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "15m",
        }
      );

      // Create output object to return to user with token and user information
      let output = {
        user_id: user.user_id,
        user_first: user.user_first,
        user_last: user.user_last,
        user_email: user.user_email,
        token: token
      };

      // Return output object to user with status code 200 (OK) and token in cookie header
      res.cookie('token', token, {
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true 
      }).status(200).json(output);
    } else {
      loginCount++;

      res.cookie('login', loginCount, {
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true
      }).status(400).json({error:"Invalid Credentials"});
    }
  } catch (err) {
    console.log(err);
  }
});

// API Routes - Login Required Routes (authentication required) - Get Events Route
app.get('/api/events/get', auth, async (req, res) => {
  try {
    // Get Events from database
    let output = await con.getEvents(req);
    res.status(200).json(output);
  } catch(err) {
    console.log(err);
  }
});

// API Routes - Login Required Routes (authentication required) - Post Event Route
app.post('/api/events/post', auth, async (req, res) => {
  try {
    // Get user input
    const { event_cost, event_date_start, event_date_end, event_location, event_max, event_name, event_type, event_description } = req.body;

    // Validate user input
    if (!(event_cost && event_date_start && event_date_end && event_location && event_max && event_name && event_type)) {
      res.status(400).json({error: "All input is required"});
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

    // Get user id from token 
    let organizer;
    jwt.verify(token, process.env.TOKEN_KEY, async (err, user) => {
      organizer = user.user_id;
    });

    // Create event in database
    let event = await con.createEvent([event_cost, event_date_start, event_date_end, event_location, event_max, event_name, organizer, event_type, event_description]);

    // return new event
    res.status(201).json(event);
  } catch (err) {
    console.log(err);
  }
});

// API Routes - Login Required Routes (authentication required) - Register Event Route
app.post('/api/events/register', auth, async(req, res) => {
  try {
    // Get user input
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

    // Get user id from token
    let userid;

    jwt.verify(token, process.env.TOKEN_KEY, async (err, user) => {
      userid = user.user_id;
    });

    // Register user for event
    let output = await con.postRegisterEvent([parseInt(userid), parseInt(event_id)]);
    res.status(200).json(output);
  } catch(err) {
    console.log(err);
  }
});

// API Routes - Login Required Routes (authentication required) - Remove Event Route
app.post('/api/events/register/remove', auth, async(req, res) => {
  try {
    // Get user input
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

    // Get user id from token
    let userid;

    jwt.verify(token, process.env.TOKEN_KEY, async (err, user) => {
      userid = user.user_id;
    });

    // Remove user from event
    let output = await con.postRegisterEventRemove([parseInt(userid), parseInt(event_id)]);
    res.status(200).json(output);
  } catch(err) {
    console.log(err);
  }
});

// API Routes - Login Required Routes (authentication required) - Delete Event Route
app.get('/api/events/delete', auth, async(req, res) => {
  try {
    // Get user input
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

    // Delete event from database (Soft Delete)
    let output = await con.deleteEvent(event_id);
    res.status(200).json(output);
  } catch(err) {
    console.log(err);
  }
});

// API Routes - Login Required Routes (authentication required) - Get User Names Route
app.post('/api/users/names', auth, async(req, res) => {
  try {
    // Get user names from database
    let output = await con.postUserNames(req.body);
    res.status(200).json(output);
  } catch(err) {
    console.log(err);
  }
});

// API Routes - Login Required Routes (authentication required) - Update Password Route
app.post('/api/user/changepassword', auth, async(req, res) => {
  try {
    // Get user input
    const { password_current, password_change, password_confirm } = req.body;

    // Validate user input
    if (!(password_current && password_change && password_confirm)) {
      res.status(400).json({error: "All input is required"});
      return;
    }

    // Validate if passwords match
    if (password_change !== password_confirm) {
      res.status(400).json({error: "Passwords do not match"});
      return;
    }

    // Validate if password is correct
    let user = await con.getUser(req.user.user_email);

    if (user && !(await bcrypt.compare(password_current + user.user_salt, user.user_password))) {
      res.status(400).send('Incorrect Password');
      return;
    }

    // Encrypt password with salt
    let salt = crypto.randomBytes(32).toString('hex');
    let encryptedPassword = await bcrypt.hash(password_change + salt, 10);

    // Update password in database
    let output = await con.changePassword([encryptedPassword, salt, req.user.user_id]);
    res.status(200).json(output);
  } catch(err) {
    console.log(err);
  }
});

// API Routes - Login Required Routes (authentication required) - Get Types Route
app.get('/api/type/get', auth, async (req, res) => {
  try {
    // Get types from database
    let output = await con.getType(req);
    res.status(200).json(output);
  } catch(err) {
    console.log(err);
  }
});

// Render Routes - Login Required Routes (authentication required) - Home Page Route
app.get('/', auth, function(req, res) {
  // Check if user is logged in and redirect to login page if not
  if (!req.auth) {
    res.redirect('/login');
    res.end();
  }

  res.render('pages/index');
});

// Render Routes - Public Routes - Login Page Route
app.get('/login', function(req, res) {
  res.render('pages/login');
});

// Render Routes - Public Routes - Register Page Route
app.get('/register', function(req, res) {
  res.render('pages/register');
});

// Render Rounts - Public Routes - Logout Route
app.get("/logout", async (req, res) => {
  try {
    // Clear cookie and redirect to login page
    res.clearCookie('token').status(200).redirect('/login');
    res.end();
  } catch (err) {
    console.log(err);
  }
});

// Listen on port
app.listen(port, () => {
  console.log('Server is listening http://localhost:' + port);
});
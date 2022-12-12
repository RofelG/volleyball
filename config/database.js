const mysql = require('mysql');
const util = require('util');

// Get Environment Variables
const { DB_HOST, DB_USER, DB_PASS, DB_DB } = process.env;

// Create Connection to Database
const connection = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_DB
}

let con = mysql.createConnection(connection)

// Promisify Query Function
con.query = util.promisify(con.query).bind(con);

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to Database!");
});

module.exports = con;
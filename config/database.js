const mysql = require('mysql');
const util = require('util');

const { DB_HOST, DB_USER, DB_PASS, DB_DB } = process.env;

const connection = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_DB
}

let con = mysql.createConnection(connection)

con.query = util.promisify(con.query).bind(con);

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to Database!");
});

module.exports = con;
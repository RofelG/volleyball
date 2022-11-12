var con = require('../config/database');

module.exports = {
  getUser: async(req, res) => {
    let query = 'SELECT * FROM user WHERE email = ? LIMIT 1';
    const [user] = await con.query(query, req).catch(err => { throw err} );
    return JSON.parse(JSON.stringify(user));
  },
  createUser: async(req, res) => {
    let query = 'INSERT INTO user (first, last, email, password) VALUES (?)';
    const [user] = await con.query(query, req).catch(err => { throw err} );
    return JSON.parse(JSON.stringify(user));
  }
}
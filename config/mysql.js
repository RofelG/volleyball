var con = require('../config/database');

module.exports = {
  getUser: async(req, res) => {
    let query = 'SELECT * FROM user WHERE email = ? LIMIT 1';
    const [user] = await con.query(query, req).catch(err => { throw err} );
    return (user === undefined ? undefined : JSON.parse(JSON.stringify(user)));
  },
  createUser: async(req, res) => {
    let query = 'INSERT INTO user (first, last, email, password, salt) VALUES (?, ?, ?, ?, ?)';
    const user = await con.query(query, req).catch(err => { throw err} );
    return user.insertId;
  },
  getEvents: async(req, res) => {
    let query = 'SELECT * FROM event WHERE 1=1 ';
    let params = [];
    let body = req.body;
    if (body.filter) {
      query += 'AND type LIKE ? ';
      params.push('%' + body.filter + '%');
    }
    query += 'ORDER BY date_start DESC LIMIT 25';
    if (body.offset) {
      query += ' OFFSET ' + body.offset;
    }
    const result = await con.query(query, params).catch(err => { throw err} );
    return (result === undefined ? undefined : JSON.parse(JSON.stringify(result)));
  }
}
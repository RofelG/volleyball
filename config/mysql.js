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
    let get = req.query;
    if (body.filter) {
      query += 'AND type LIKE ? ';
      params.push('%' + body.filter + '%');
    }
    query += 'ORDER BY date_start DESC LIMIT 25';
    if (get.offset > 0) {
      query += ' OFFSET ' + (get.offset - 1);
    }

    console.log(query);
    const result = await con.query(query, params).catch(err => { throw err} );
    return (result === undefined ? undefined : JSON.parse(JSON.stringify(result)));
  },
  createEvent: async(req, res) => {
    let query = 'INSERT INTO event (cost, date_start, date_end, location, max, name, organizer, type, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const event = await con.query(query, req).catch(err => { throw err} );
    return event.insertId;
  }
}
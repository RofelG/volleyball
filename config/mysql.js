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
  postUserNames: async(req, res) => {
    let query = 'SELECT first, last FROM user WHERE 1=1 AND ' 
    let body = req;
    let params = [];
    for(let i = 0; i < body.length; i++) {
      if (i > 0) query += ' OR ';
      query += 'user_id = ?';
      params.push(body[i]);
    }
    const user = await con.query(query, req).catch(err => { throw err} );
    return (user === undefined ? undefined : JSON.parse(JSON.stringify(user)));
  },
  getEvents: async(req, res) => {
    let query = 'SELECT * FROM event WHERE 1=1 ';
    let params = [];
    let get = req.query;
    if (get.filter) {
      query += 'AND type LIKE ? ';
      params.push('%' + get.filter + '%');
    }
    if (get.event_id) {
      query += 'AND event_id = ? ';
      params.push(get.event_id);
    }
    query += 'ORDER BY date_start ASC LIMIT 25';
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
  },
  postRegisterEvent: async(req, res) => {
    let query = 'SELECT * FROM event WHERE event_id = ? LIMIT 1';
    const eventData = await con.query(query, req[1]).catch(err => { throw err} );

    console.log(eventData);
    let eventUsers = JSON.parse(eventData[0].users);
    if (eventUsers == null) {
      users = [req[0]];
    } else {
      console.log(`length vs. max`, eventUsers.length , eventData[0].max);
      if (eventUsers.length < eventData[0].max) {
        if(eventUsers.includes(req[0])) {
          return { error: 'User already registered for event' };
        }

        eventUsers.push(req[0]);
      } else {
        return { error: 'Event is full' };
      }
    }

    query = 'UPDATE event SET users=? WHERE event_id = ?';
    const event = await con.query(query, [JSON.stringify(eventUsers), req[1]]).catch(err => { throw err} );
    return event;
  }
}
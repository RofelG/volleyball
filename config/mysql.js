var con = require('../config/database');

function logQueries(req) {
  let query = 'INSERT INTO log (log_query, log_req, log_call, log_date) VALUES (?, ?, ?, ?)';
  let values = [...req];
  if (!values[1]) {
    values[1] = null;
  } else {
    values[1] = JSON.stringify(values[1]);
  }
  values.push(new Date());

  con.query(query, values).catch(err => { throw err });
}

module.exports = {
  getUser: async(req, res) => {
    let query = 'SELECT * FROM user WHERE user_email = ? LIMIT 1';
    const [user] = await con.query(query, req).catch(err => { throw err} );
    logQueries([query, req, req.url]);
    return (user === undefined ? undefined : JSON.parse(JSON.stringify(user)));
  },
  createUser: async(req, res) => {
    let query = 'INSERT INTO user (user_first, user_last, user_email, user_password, user_salt) VALUES (?, ?, ?, ?, ?)';
    const user = await con.query(query, req).catch(err => { throw err} );
    logQueries([query, req, req.url]);
    return user.insertId;
  },
  changePassword: async(req, res) => {
    let query = 'UPDATE user SET user_password = ?, user_salt = ? WHERE user_id = ?';
    const user = await con.query(query, req).catch(err => { throw err} );
    logQueries([query, req, req.url]);
    return user;
  },
  postUserNames: async(req, res) => {
    let query = 'SELECT user_id, user_first, user_last FROM user WHERE 1=1 AND ' 
    let body = req;
    console.log(req);
    let params = [];
    if (body.length == 0) return {};

    for(let i = 0; i < body.length; i++) {
      if (i > 0) query += ' OR ';
      query += 'user_id = ?';
      params.push(body[i]);
    }
    const user = await con.query(query, req).catch(err => { throw err} );
    logQueries([query, params, req.url]);
    return (user === undefined ? undefined : JSON.parse(JSON.stringify(user)));
  },
  getEvents: async(req, res) => {
    let query = 'SELECT * FROM event LEFT JOIN user ON user_id = event_organizer LEFT JOIN type ON event_type = type_id WHERE 1=1 ';
    let params = [];
    let get = req.query;

    let curDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let prevDate = new Date();
    prevDate.setDate(prevDate.getDate() - 30);
    prevDate = prevDate.toISOString().slice(0, 19).replace('T', ' ');

    if (get.filter) {
      query += 'AND type_name LIKE ? ';
      params.push('%' + get.filter + '%');
    }
    if (get.event_id) {
      query += 'AND event_id = ? ';
      params.push(get.event_id);
    }
    query += ' AND (("' + curDate + '" < event_date_end AND event_status = 1) OR (event_organizer = 1 AND "' + prevDate + '" < event_date_end AND event_status = 1)) ORDER BY event_date_start ASC';

    if (get.offset > 0) {
      query += ' OFFSET ' + (get.offset - 1);
    }

    const result = await con.query(query, params).catch(err => { throw err} );
    logQueries([query, params, req.url]);
    return (result === undefined ? undefined : JSON.parse(JSON.stringify(result)));
  },
  createEvent: async(req, res) => {
    let query = 'INSERT INTO event (event_cost, event_date_start, event_date_end, event_location, event_max, event_name, event_organizer, event_type, event_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const event = await con.query(query, req).catch(err => { throw err} );
    logQueries([query, req, req.url]);
    return event.insertId;
  },
  postRegisterEvent: async(req, res) => {
    let query = 'SELECT * FROM event WHERE event_id = ? LIMIT 1';
    const eventData = await con.query(query, req[1]).catch(err => { throw err} );

    let eventUsers = JSON.parse(eventData[0].event_users);

    if (req[0] == null) return { error: 'User not found' };

    if (eventUsers == null) {
      eventUsers = [req[0]];
    } else {
      if (eventUsers.length < eventData[0].event_max) {
        if(eventUsers.includes(req[0])) {
          return { error: 'Already registered for event' };
        }

        eventUsers.push(req[0]);
      } else {
        return { error: 'Event is full' };
      }
    }

    query = 'UPDATE event SET event_users=? WHERE event_id = ?';
    const event = await con.query(query, [JSON.stringify(eventUsers), req[1]]).catch(err => { throw err} );
    logQueries([query, [JSON.stringify(eventUsers), req[1]], req.url]);
    return event;
  },
  postRegisterEventRemove: async(req, res) => {
    let query = 'SELECT * FROM event WHERE event_id = ? LIMIT 1';
    const eventData = await con.query(query, req[1]).catch(err => { throw err} );

    let eventUsers = JSON.parse(eventData[0].event_users);

    if (req[0] == null) return { error: 'User not found' };

    if (eventUsers != null) {
      for (let users in eventUsers) {
        if (eventUsers[users] == req[0]) {
          eventUsers.splice(users, 1);
          break;
        }
      }
    }

    query = 'UPDATE event SET event_users=? WHERE event_id = ?';
    const event = await con.query(query, [JSON.stringify(eventUsers), req[1]]).catch(err => { throw err} );
    logQueries([query, [JSON.stringify(eventUsers), req[1]], req.url]);
    return event;
  },
  deleteEvent: async(req, res) => {
    let query = 'UPDATE event SET event_status=? WHERE event_id = ?';
    console.log(query);
    console.log([-1, req]);
    const event = await con.query(query, [-1, req]).catch(err => { throw err} );
    logQueries([query, [-1, req], req.url]);
    return (event === undefined ? false : true);
  },
  getType: async(req, res) => {
    let query = 'SELECT * FROM type WHERE type_status = 1 ORDER BY type_name ASC';

    const result = await con.query(query).catch(err => { throw err} );
    logQueries([query, null, req.url]);
    return (result === undefined ? undefined : JSON.parse(JSON.stringify(result)));
  },
}
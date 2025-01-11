'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Get all users
 * @param {*} db the data db object.
 * @returns all users.
 */
exports.getAll = (db, limit, offset) => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM user LIMIT ? OFFSET ?`, [limit, offset], (err, rows) => {
            if (err) reject(new Error(err.message));

            // count all users
            const totalQuery = `SELECT COUNT(*) AS total FROM user`;
            const totalResult = db.get(totalQuery);
            const total = totalResult.total;
            let result = {
              status: 'success',
              data: rows,
              pagination: {
                  total,
                  limit,
                  offset,
                  nextOffset: offset + limit < total ? offset + limit : null,
                  prevOffset: offset - limit >= 0 ? offset - limit : null,
              },
            }
            
            resolve(result);
          }
        );
      });
}

/**
 * Gets one user by id.
 * @param {*} db the data db object. 
 * @param {*} id the user id.
 * @returns the user.
 */
exports.getOne = (db, id) => {
  return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM user WHERE id = ?`, [id], (err, row) => {
          if (err) reject(new Error(err.message));
          if (!row) reject(new Error('unable to find current user.'));

          resolve(row);
        }
      );
    });
}

/**
 * Create user with google uid.
 * @param {*} db the data db object.
 * @param {*} name the user name.
 * @param {*} google_uid the user google uid.
 * @returns created user object.
 */
exports.create = (db, name, google_uid = null) => {
  const id = uuidv4(), key = uuidv4();
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO user (id, name, google_uid, api_key) VALUES (?, ?, ?, ?)`, [id, name, google_uid, key], (err) => {
      if (err) {
          if (err.message.includes("UNIQUE constraint failed")) {
              reject(new Error("User already exist."));
          }
          reject(new Error(err.message));
      }

      resolve({
          id: id,
          name: name,
          google_uid: google_uid,
          api_key: key
      });
    });
  });
}

/**
 * Update user with google uid.
 * @param {*} db the data db object.
 * @param {*} name the user name.
 * @param {*} user_id the user uid.
 * @returns updated user object.
 */
exports.update = (db, name, user_id) => {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE user SET name = ? WHERE id = ?`, [name, user_id], (err) => {
        if (err) reject(new Error(err.message));
        if (this.changes === 0) reject(new Error('unable to find current user.'));
        
        // Get the update user
        db.get(
          `SELECT * FROM user WHERE id = ?`,
          [user_id],
          (err, row) => {
            if (err) {
              return reject(new Error(err.message));
            }
            resolve(row);
          }
        );
    });
  });
}

/**
 * Delete current user.
 * @param {*} db the data db object.
 * @param {*} id the user id.
 * @returns success message.
 */
exports.delete = (db, id) => {
  return new Promise((resolve, reject) => {
      db.run(`DELETE FROM user WHERE id = ?`, [id], (err) => {
        if (err) return reject(new Error(err.message));
        if (this.changes === 0) reject(new Error({ message: 'unable to find current user.' }));

        resolve({ message: success });
      });
  });
}
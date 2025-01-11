'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Get all users
 * @param {*} connection the data connection object.
 * @returns all users.
 */
exports.getAll = (connection) => {
    return new Promise((resolve, reject) => {
        connection.all(
          `SELECT * FROM user`,
          (err, rows) => {
            if (err) reject(new Error(err.message));
            
            resolve(rows);
          }
        );
      });
}

/**
 * Gets one user by id.
 * @param {*} connection the data connection object. 
 * @param {*} id the user id.
 * @returns the user.
 */
exports.getOne = (connection, id) => {
  return new Promise((resolve, reject) => {
      connection.get(
        `SELECT * FROM user WHERE id = ?`, [id],
        (err, row) => {
          if (err) reject(new Error(err.message));
          if (!row) reject(new Error('unable to find current user.'));

          resolve(row);
        }
      );
    });
}

/**
 * Create user with google uid.
 * @param {*} connection the data connection object.
 * @param {*} name the user name.
 * @param {*} google_uid the user google uid.
 * @returns created user object.
 */
exports.create = (connection, name, google_uid = null) => {
  const id = uuidv4(), key = uuidv4();
  return new Promise((resolve, reject) => {
    connection.run(
        `INSERT INTO user (id, name, google_uid, api_key) VALUES (?, ?, ?, ?)`,
    [id, name, google_uid, key],
    (err) => {
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
 * @param {*} connection the data connection object.
 * @param {*} name the user name.
 * @param {*} user_id the user uid.
 * @returns updated user object.
 */
exports.update = (connection, name, user_id) => {
  return new Promise((resolve, reject) => {
    connection.run(
      `UPDATE user SET name = ? WHERE id = ?`,
      [name, user_id],
      (err) => {
        if (err) reject(new Error(err.message));
        if (this.changes === 0) reject(new Error('unable to find current user.'));
        
        // Get the update user
        connection.get(
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
 * @param {*} connection the data connection object.
 * @param {*} id the user id.
 * @returns success message.
 */
exports.delete = (connection, id) => {
  return new Promise((resolve, reject) => {
      connection.run(`DELETE FROM user WHERE id = ?`, [id], (err) => {
          if (err) return reject(new Error(err.message));
          if (this.changes === 0) reject(new Error({ message: 'unable to find current user.' }));

          resolve({ message: success });
      });
  });
}
'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Get all sample.
 * @param {*} connection the data connection object. 
 * @returns all sample.
 */
exports.getAll = (connection) => {
    return new Promise((resolve, reject) => {
        connection.all(
          `SELECT id, content, created_at, updated_at FROM sample`,
          (err, rows) => {
            if (err) reject(new Error(err.message));
            
            resolve(rows);
          }
        );
      });
}

/**
 * Gets sample content by id.
 * @param {*} connection the data connection object. 
 * @param {*} id the sample id.
 * @returns the sample content.
 */
exports.getSampleContent = (connection, id) => {
    return new Promise((resolve, reject) => {
        connection.get(
          `SELECT content FROM sample WHERE id = ?`, [id],
          (err, row) => {
            if (err) reject(new Error(err.message));
            if (!row) reject(new Error('unable to find current sample.'));

            resolve(JSON.parse(row.content));
          }
        );
      });
}

/**
 * Get sample content by api key.
 * @param {*} connection the data connection object.
 * @param {*} api_key the user api key
 * @returns the sample content.
 */
exports.getSampleContentByKey = (connection, api_key) => {
    return new Promise((resolve, reject) => {
        connection.get(
            `SELECT sample.content FROM user JOIN sample ON user.id = sample.user_id WHERE api_key = ? LIMIT 1`,
            [api_key],
            (err, row) => {
                if (err) reject(new Error(err.message));
                if (!row) reject(new Error('unable to find current sample.'));

                resolve(JSON.parse(row.content));
            }
        );
    });
}

/**
 * Verify if current user account exist in db.
 * @param {*} connection the data connection object.
 * @param {*} googleUid the user google uid.
 * @returns true if the google account exist in database.
 */
exports.isGoogleAccExist = (connection, googleUid) => {
    return new Promise((resolve, reject) => {
        connection.get(
          `SELECT 1 FROM user WHERE google_uid = ? LIMIT 1`,
          [googleUid],
          (err, row) => {
            if (err) reject(new Error(err.message));
            
            resolve(!!row);
          }
        );
      });
}

/**
 * Get the user api key from google uid.
 * @param {*} connection the data connection object.
 * @param {*} googleUid the user google uid.
 * @returns the api key for entered google uid.
 */
exports.getUserApiKeyWithGoogleUid = (connection, googleUid) => {
    return new Promise((resolve, reject) => {
        connection.get(
            `SELECT user.api_key FROM user JOIN sample ON user.id = sample.user_id WHERE google_uid = ? LIMIT 1`,
            [googleUid],
            (err, row) => {
            if (err) reject(new Error(err.message));

            resolve(row.api_key);
        });
    });
}

/**
 * Create user with google uid.
 * @param {*} connection the data connection object.
 * @param {*} google_uid the user google uid.
 * @param {*} google_name the user name.
 * @returns created user object.
 */
exports.createUserWithGoogleUid = (connection, google_uid, google_name) => {
    const id = uuidv4(), key = uuidv4();
    return new Promise((resolve, reject) => {
        connection.run(
            `INSERT INTO user (id, name, google_uid, api_key) VALUES (?, ?, ?, ?)`,
        [id, google_name, google_uid, key],
        (err) => {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    reject(new Error("Utilisateur déjà existant."));
                }
                reject(new Error(err.message));
            }

            resolve({
                id: id,
                name: google_name,
                google_uid: google_uid,
                api_key: key
            });
        });
    });
}

/**
 * Create a sample with given user id.
 * @param {*} user_id the user id.
 * @returns the sample.
 */
exports.create = (user_id) => {
    const id = uuidv4();
    const createdAt = new Date().toISOString(), updatedAt = createdAt;
    return new Promise((resolve, reject) => {
        connection.run(
            `INSERT INTO sample (id, content, created_at, updated_at, user_id) VALUES (?, ?, ?, ?, ?)`,
        [id, JSON.stringify({}), createdAt, updatedAt, user_id],
        (err) => {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    reject(new Error("sample already exist."));
                }
                reject(new Error(err.message));
            }

            resolve({
                id: id,
                content: JSON.stringify({}),
                createdAt: createdAt,
                updatedAt: updatedAt,
                user_id: user_id
            });
        });
    });
}

/**
 * Update current content of sample
 * @param {*} api_key api key of the sample
 * @param {*} content the content of the sample
 * @returns the sample id.
 */
exports.update = (connection, api_key, content) => {
    return new Promise((resolve, reject) => {
        connection.run(
            `UPDATE sample SET content = ?, updated_at = ? WHERE sample.user_id IN (SELECT user.id FROM user WHERE user.api_key = ?)`,
            [JSON.stringify(content), new Date().toISOString(), api_key], (err) => {
            if (err) return reject(new Error(err.message));
            if (this.changes === 0) reject(new Error({ message: 'unable to find current api key.' }));

                resolve({ message: success });
        });
    });
}

/**
 * Delete current sample.
 * @param {*} connection the data connection object.
 * @param {*} id the sample id.
 * @returns success message.
 */
exports.delete = (connection, id) => {
    return new Promise((resolve, reject) => {
        connection.run(`DELETE FROM sample WHERE id = ?`, [id], (err) => {
            if (err) return reject(new Error(err.message));
            if (this.changes === 0) reject(new Error({ message: 'unable to find current sample.' }));

            resolve({ message: success });
        });
    });
}
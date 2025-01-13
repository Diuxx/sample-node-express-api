'use strict';

const { v4: uuidv4 } = require('uuid');
const utils = require('../utils');

/**
 * Get all sample.
 * @param {*} db the data db object. 
 * @returns all sample.
 */
exports.getAll = (db, limit, offset) => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT id, content, created_at, updated_at FROM sample LIMIT ? OFFSET ?`, [limit, offset], (err, rows) => {
            if (err) reject(new Error(err.message));
            
            // count all samples
            const totalQuery = `SELECT COUNT(*) AS total FROM sample`;
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
 * Gets sample content by id.
 * @param {*} db the data db object. 
 * @param {*} id the sample id.
 * @returns the sample content.
 */
exports.getSampleContent = (db, id) => {
    return new Promise((resolve, reject) => {
        db.get(
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
 * 
 * @param {*} db 
 * @param {*} uid 
 * @param {*} google_name 
 * @returns 
 */
exports.getSampleContentOrCreate = async (db, uid, google_name) => {
    try {
        let apiKey = null, json = null;
        console.log(db);
        await utils.runQuery(db, 'BEGIN TRANSACTION');

        const userExists = await utils.getQuery(db, `SELECT 1 FROM user WHERE google_uid = ? LIMIT 1`, [uid]);
        if (!userExists) {
            // --
            const user = await this.createUserWithGoogleUid(db, uid, google_name);
            await this.create(db, user.id); // create the user.
            apiKey = user.api_key;
        } 
        else {
            apiKey = await this.getUserApiKeyWithGoogleUid(db, uid);
        }

        if (apiKey) {
            json = await this.getSampleContentByKey(db, apiKey);
        } 
        else throw new Error('unable to retrieve the api key.');

        if (!json) throw new Error('unable to retrieve json file.');
        
        await utils.runQuery(db, 'COMMIT'); // validate
        return { key: apiKey, data: json };
    } 
    catch (error) {
        await utils.runQuery(db, 'ROLLBACK');
        throw error;
    }
}

/**
 * Get sample content by api key.
 * @param {*} db the data db object.
 * @param {*} api_key the user api key
 * @returns the sample content.
 */
exports.getSampleContentByKey = (db, api_key) => {
    return new Promise((resolve, reject) => {
        db.get(
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
 * @param {*} db the data db object.
 * @param {*} googleUid the user google uid.
 * @returns true if the google account exist in database.
 */
exports.isGoogleAccExist = (db, googleUid) => {
    return new Promise((resolve, reject) => {
        db.get(
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
 * @param {*} db the data db object.
 * @param {*} googleUid the user google uid.
 * @returns the api key for entered google uid.
 */
exports.getUserApiKeyWithGoogleUid = (db, googleUid) => {
    return new Promise((resolve, reject) => {
        db.get(
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
 * @param {*} db the data db object.
 * @param {*} google_uid the user google uid.
 * @param {*} google_name the user name.
 * @returns created user object.
 */
exports.createUserWithGoogleUid = (db, google_uid, google_name) => {
    const id = uuidv4(), key = uuidv4();
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO user (id, name, google_uid, api_key) VALUES (?, ?, ?, ?)`,
            [id, google_name, google_uid, key], (err) => {
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
exports.create = (db, user_id) => {
    const id = uuidv4();
    const createdAt = new Date().toISOString(), updatedAt = createdAt;
    return new Promise((resolve, reject) => {
        db.run(
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
exports.update = (db, api_key, content) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE sample SET content = ?, updated_at = ? WHERE sample.user_id IN (SELECT user.id FROM user WHERE user.api_key = ?)`,
            [JSON.stringify(content), new Date().toISOString(), api_key], (err) => {
            if (err) return reject(new Error(err.message));
            if (this.changes === 0) reject(new Error({ message: 'unable to find current api key.' }));

            resolve({ message: "success" });
        });
    });
}

/**
 * Delete current sample.
 * @param {*} db the data db object.
 * @param {*} id the sample id.
 * @returns success message.
 */
exports.delete = (db, id) => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM sample WHERE id = ?`, [id], (err) => {
            if (err) return reject(new Error(err.message));
            if (this.changes === 0) reject(new Error({ message: 'unable to find current sample.' }));

            resolve({ message: success });
        });
    });
}
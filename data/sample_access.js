const { v4: uuidv4 } = require('uuid');

function isGoogleAccExist(connection, googleUid) {
    return new Promise((resolve, reject) => {
        connection.get(
          `SELECT 1 FROM user WHERE google_uid = ? LIMIT 1`,
          [googleUid],
          (err, row) => {
            if (err) {
              return reject(new Error(err.message));
            }

            resolve(!!row);
          }
        );
      });
}

function getUserApiKeyWithGoogleUid(connection, googleUid) {
    return new Promise((resolve, reject) => {
        connection.get(
            `SELECT user.api_key AS count FROM user JOIN sample ON user.id = sample.user_id WHERE google_uid = ? LIMIT 1`,
            [googleUid],
            (err, row) => {
            if (err) {
                return reject(new Error(err.message));
            }

            resolve(row.api_key);
        });
    });
}

function createUserWithGoogleUid(connection, google_uid, google_name) {
    const id = uuidv4(), key = uuidv4();
    return new Promise((resolve, reject) => {
        connection.run(
            `INSERT INTO user (id, name, google_uid, api_key) VALUES (?, ?, ?, ?)`,
        [id, google_name, google_uid, key],
        (err) => {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    return reject(new Error("Utilisateur déjà existant."));
                }
                return reject(new Error(err.message));
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

const sampleDataAccess = {
    isGoogleAccExist,
    getUserApiKeyWithGoogleUid,
    createUserWithGoogleUid,
};

module.exports = sampleDataAccess;
'use strict';

const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

module.exports = (config) => {
    //  --
    const pathData = path.join(config.pathData, config.data);
    const db = new sqlite3.Database(pathData);

    console.log(`[${config.name}][✔] database created ${pathData}`);

    // if sample running 
    if (config.sample) {
        db.run(`
            CREATE TABLE IF NOT EXISTS user (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                google_uid TEXT UNIQUE NOT NULL,
                api_key TEXT UNIQUE NOT NULL
            )`);
        
        db.run(`
            CREATE TABLE IF NOT EXISTS sample (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                user_id TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
            )`);

        db.get(`SELECT COUNT(*) AS count FROM user JOIN sample ON user.id = sample.user_id`, (err, row) => {
            if (err) {
                console.error('Erreur lors de la vérification des tables :', err.message);
                return;
            }

            if (row.count === 0) {
                const sampleDataObject = {
                    now: new Date().toISOString(),
                    userUid: uuidv4(),
                    userGoogleUid: uuidv4(),
                    userApiKey: uuidv4()
                }

                const sampleUserData = [{ id: sampleDataObject.userUid, name: 'sample', google_uid: sampleDataObject.userGoogleUid, api_key: sampleDataObject.userApiKey }];
                const stmtUser = db.prepare(`INSERT INTO user (id, name, google_uid, api_key) VALUES (?, ?, ?, ?)`);
                sampleUserData.forEach((data) => {
                    stmtUser.run(data.id, data.name, data.google_uid, data.api_key, (err) => {
                        if (err) {
                            console.error('Erreur lors de l\'insertion :', err.message);
                        }
                    });
                });
                stmtUser.finalize(() => console.log('User data inserted.'));

                // sample data
                const sampleData = [
                    { id: uuidv4(), content: JSON.stringify({ value: "Default value 1" }), created_at: sampleDataObject.now, updated_at: sampleDataObject.now, user_id: sampleDataObject.userUid },
                ];
                const stmt = db.prepare(`INSERT INTO sample (id, content, created_at, updated_at, user_id) VALUES (?, ?, ?, ?, ?)`);
                sampleData.forEach((data) => {
                    stmt.run(data.id, data.content, data.created_at, data.updated_at, data.user_id, (err) => {
                        if (err) {
                            console.error('Erreur lors de l\'insertion :', err.message);
                        }
                    });
                });
        
                stmt.finalize(() => console.log('Données par défaut insérées.'));
            }
        });
        
        console.log(`[${config.name}][✔] init sample data`)
    }
    
    // return db instance.
    return db;
};

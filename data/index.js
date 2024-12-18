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
        db.run(`CREATE TABLE IF NOT EXISTS sample (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )`);

        db.get(`SELECT COUNT(*) AS count FROM sample`, (err, row) => {
            if (err) {
                console.error('Erreur lors de la vérification de la table :', err.message);
                return;
            }
        
            if (row.count === 0) {
                const now = new Date().toISOString();
        
                const sampleData = [
                    { id: uuidv4(), content: JSON.stringify({ value: "Default value 1" }), created_at: now, updated_at: now },
                    { id: uuidv4(), content: JSON.stringify({ value: "Default value 2" }), created_at: now, updated_at: now }
                ];
        
                const stmt = db.prepare(`INSERT INTO sample (id, content, created_at, updated_at) VALUES (?, ?, ?, ?)`);
        
                sampleData.forEach((data) => {
                    stmt.run(data.id, data.content, data.created_at, data.updated_at, (err) => {
                        if (err) {
                            console.error('Erreur lors de l\'insertion :', err.message);
                        }
                    });
                });
        
                stmt.finalize(() => console.log('Données par défaut insérées.'));
            }
            else {
                console.log('La table sample contient déjà des données.');
            }
        });
        console.log(`[${config.name}][✔] init sample data`)
    }
    
    // return db instance.
    return db;
};

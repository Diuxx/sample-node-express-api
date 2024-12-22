'use strict';

// routes/sample.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const {
    isGoogleAccExist,
    createUserWithGoogleUid,
    getUserApiKeyWithGoogleUid
} = require('../data/sample_access');

// get all samples
router.get('/', async (req, res) => {
    try {
        req.base.all(`SELECT id, content, created_at, updated_at FROM sample`, (err, rows) => {
            if (err) throw err.message;//res.status(500).json({ message:  });
    
            // Transformer les contenus JSON pour qu'ils soient bien parsés
            const results = rows.map((row) => ({
                id: row.id,
                content: row.content,
                created_at: row.created_at,
                updated_at: row.updated_at
            }));
    
            res.json(results);
        });
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// get one sample
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);

        req.base.get(`SELECT content FROM sample WHERE id = ?`, [id], (err, row) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!row) return res.status(404).json({ message: 'unable to find current key.' });
    
            res.json(JSON.parse(row.content));
        });
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// post one sample
router.post('/', async (req, res) => {
    try {
        const { content } = req.body;
        const id = uuidv4();
        const createdAt = new Date().toISOString(), updatedAt = createdAt;
    
        req.base.run(
            `INSERT INTO sample (id, content, created_at, updated_at) VALUES (?, ?, ?, ?)`,
            [id, JSON.stringify(content), createdAt, updatedAt || null],
            function (err) {
                if (err) throw err.message;
                res.status(201).json({ id, url: `/sample/${id}` });
            }
        );
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// create or get one sample
router.post('/retrieve', async (req, res) => {
    try {
        const { google_uid, google_name } = req.body;

        if (!google_uid) {
            res.status(400).json({ message: 'google_uid is required.' });
            return;
        }

        if (!google_name) {
            res.status(400).json({ message: 'google_name is required.' });
            return;
        }

        const exist = await isGoogleAccExist(req.base, google_uid);
        if (exist) {
            const apiKey = await getUserApiKeyWithGoogleUid(req.base, google_uid);
            res.status(200).json({ key: apiKey });
        }
        else {
            const user = await createUserWithGoogleUid(req.base, google_uid, google_name)
            res.status(200).json({ key: user.api_key });
        }
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// put one sample
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let { content } = req.body;

        if (id == undefined || content == undefined) {
            res.status(301).json({ message: 'content is required.' });
            return;
        }

        if (typeof content == 'string')
            content = JSON.parse(content);
    
        req.base.run(
            `UPDATE sample SET content = ?, updated_at = ? WHERE id = ?`,
            [JSON.stringify(content), new Date().toISOString(), id],
            function (err) {
                if (err) return res.status(500).json({ message: err.message });
                if (this.changes === 0) return res.status(404).json({ message: 'unable to find current key.' });
    
                res.json({ message: 'Fichier mis à jour avec succès' });
            }
        );
    } 
    catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        req.base.run(`DELETE FROM sample WHERE id = ?`, [id], function (err) {
            if (err) return res.status(500).json({ message: err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'Fichier non trouvé' });
    
            res.json({ message: 'Fichier supprimé avec succès' });
        });
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
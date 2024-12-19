'use strict';

// routes/sample.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// get all samples
router.get('/', async (req, res) => {
    try {
        req.base.all(`SELECT id, content, created_at, updated_at FROM sample`, (err, rows) => {
            if (err) throw err.message;//res.status(500).json({ error:  });
    
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

        req.base.get(`SELECT content FROM sample WHERE id = ?`, [id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Fichier non trouvé' });
    
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

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
    
        req.base.run(
            `UPDATE sample SET content = ?, updated_at = ? WHERE id = ?`,
            [JSON.stringify(content), new Date().toISOString(), id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'Fichier non trouvé' });
    
                res.json({ message: 'Fichier mis à jour avec succès' });
            }
        );
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        req.base.run(`DELETE FROM sample WHERE id = ?`, [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Fichier non trouvé' });
    
            res.json({ message: 'Fichier supprimé avec succès' });
        });
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
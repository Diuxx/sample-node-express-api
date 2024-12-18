'use strict';

// routes/sample.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// get all data
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

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const base = req.base;
        console.log(base)
        res.status(200).json(base.data);
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { content } = req.body;
        const id = uuidv4();
        const createdAt = new Date().toISOString(), updatedAt = createdAt;
    
        req.base.run(
            `INSERT INTO json_files (id, content, created_at, updated_at) VALUES (?, ?, ?, ?)`,
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
    const { id } = req.params;

    try {
        const base = req.base;
        console.log(base)
        res.status(200).json(base.data);
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;


    try {
        const base = req.base;
        console.log(base)
        res.status(200).json(base.data);
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
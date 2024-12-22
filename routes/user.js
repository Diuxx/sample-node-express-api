'use strict';

// routes/user.js
const express = require('express');
const router = express.Router();
const dao = require('../data/user.dao');

// get all users
router.get('/', async (req, res) => {
    try {
        const results = await dao.getAll(req.base);
        res.status(200).json(results);
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// get one user
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: 'id is required.' });
            return;
        }

        res.json(await dao.getOne(req.base, id));
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// create a user
router.post('/', async (req, res) => {
    try {
        const { name, google_id } = req.body;
        const result = await dao.create(req.base, name, google_id);

        res.status(201).json(result);
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// put a user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (name == undefined) {
            res.status(301).json({ message: 'the name is required.' });
            return;
        }

        const user_id = await dao.update(req.base, name, id);
        res.status(200).json({ id: user_id });
    } 
    catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// delete user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        res.status(200).json(await dao.delete(req.base, id));
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
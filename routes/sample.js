'use strict';

// routes/sample.js
const express = require('express');
const router = express.Router();
const dao = require('../data/sample.dao');

// get all samples
router.get('/', async (req, res) => {
    try {
        const results = await dao.getAll(req.base);
        res.status(200).json(results);
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// get one sample
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: 'id is required.' });
            return;
        }
        res.json(await dao.getSampleContent(req.base, id));
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// get one sample by apiKey
router.get('/bykey/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: 'id is required.' });
            return;
        }
        res.status(200).json(await dao.getSampleContentByKey(req.base, id));
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// post one sample
router.post('/', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({ message: 'userId is required.' });
            return;
        }

        await dao.create(req.base, userId);
        res.status(201).json({ id, url: `/sample/${id}` });
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// create or get one sample
router.post('/retrieve', async (req, res) => {
    console.log(req.body);
    let apiKey = null;

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

        // --
        const exist = await dao.isGoogleAccExist(req.base, google_uid);
        if (exist) {
            apiKey = await dao.getUserApiKeyWithGoogleUid(req.base, google_uid);
        }
        else {
            const user = await dao.createUserWithGoogleUid(req.base, google_uid, google_name);
            console.log(user)

            await dao.create(req.base, user.id);
            apiKey = user.api_key;
        }

        if (apiKey) {
            const json = await dao.getSampleContentByKey(req.base, apiKey);
            res.status(200).json({ key: apiKey, data: json });
        } else 
            throw 'unable to get api key.';
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

        res.status(200).json(await dao.update(req.base, id, content));
    } 
    catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

// delete
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
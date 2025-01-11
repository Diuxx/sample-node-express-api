'use strict';

// routes/sample.js
const express = require('express');
const router = express.Router();
const dao = require('../data/sample.dao');

// middlewares
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');

// schemas
const sampleSchema = require('../schemas/sample.schema');

/**
 * @route GET /
 * @description Retrieves all records from the specified database and returns them as a JSON response.
 * 
 * @param {Object} req - HTTP request object.
 * @param {string} req.base - Database to query.
 * @param {Object} res - HTTP response object.
 * @returns {void}
 * 
 * @middleware asyncHandler - Handles errors in async operations.
 * @throws {Error} - If dao.getAll fails.
 */
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const results = await dao.getAll(req.base);
        res.status(200).json(results);
    })
);

/**
 * @route GET /:id
 * @description Fetches a specific record by ID from the database and returns it as JSON.
 * 
 * @param {Object} req - HTTP request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.id - ID of the record to retrieve.
 * @param {string} req.base - Database to query.
 * @param {Object} res - HTTP response object.
 * @returns {void}
 * 
 * @middleware asyncHandler - Handles async errors.
 * @throws {Error} - If dao.getSampleContent fails or the ID is missing.
 * 
 * @response 
 * - 400: If `id` is not provided.
 * - 200: Returns the requested record as JSON.
 */
router.get(
    '/:id',
    asyncHandler(async (req, res) => {
        // --
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: 'id is required.' });
            return;
        }

        res.json(await dao.getSampleContent(req.base, id));
    })
);

// get one sample by apiKey
router.get(
    '/bykey/:id', 
    asyncHandler(async (req, res) => {
        // --
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: 'id is required.' });
            return;
        }

        res.status(200).json(await dao.getSampleContentByKey(req.base, id));
    })
);

// post one sample
router.post(
    '/', 
    asyncHandler(async (req, res) => {
        // --
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({ message: 'userId is required.' });
            return;
        }

        await dao.create(req.base, userId);
        res.status(201).json({ id, url: `/sample/${id}` });
    })
);

// create or get one sample
router.post(
    '/retrieve', 
    asyncHandler(async (req, res) => {
        // --
        let apiKey = null;
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
        if (!exist) {
            // create user account here.
        }

        if (exist) {
            apiKey = await dao.getUserApiKeyWithGoogleUid(req.base, google_uid);
        }
        else {
            const user = await dao.createUserWithGoogleUid(req.base, google_uid, google_name);
            
            await dao.create(req.base, user.id);
            apiKey = user.api_key;
        }

        if (apiKey) {
            const json = await dao.getSampleContentByKey(req.base, apiKey);
            res.status(200).json({ key: apiKey, data: json });
        } else throw 'unable to get api key.';
    })
);

// put one sample
router.put(
    '/:id',
    validate(sampleSchema),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        let { content } = req.body;

        if (id == undefined || content == undefined) {
            res.status(301).json({ message: 'content is required.' });
            return;
        }

        if (typeof content == 'string')
            content = JSON.parse(content);

        res.status(200).json(await dao.update(req.base, id, content));
    })
);

// delete
router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        res.status(200).json(await dao.delete(req.base, id));
   })
);

module.exports = router;
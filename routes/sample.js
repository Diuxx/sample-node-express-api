'use strict';

// routes/sample.js
const express = require('express');
const router = express.Router();
const dao = require('../data/sample.dao');
const utils = require('../utils');

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
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        
        const results = await dao.getAll(req.base, limit, offset);
        res.status(200).json(utils.formatHttpSuccess(results));
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

        let sample = await dao.getSampleContent(req.base, id)
        res.status(200).json(utils.formatHttpSuccess(sample));
    })
);

/**
 * @route   GET /bykey/:id
 * @desc    Récupère un contenu spécifique à partir de la clé (id)
 * @param   {string} id - Identifiant de la clé passée dans l'URL
 * @returns {object} 200 - Contenu formaté en cas de succès
 * @returns {object} 400 - Erreur si l'id est manquant
 */
router.get(
    '/bykey/:id', 
    asyncHandler(async (req, res) => {
        // --
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: 'id is required.' });
            return;
        }

        let sample = await dao.getSampleContentByKey(req.base, id)
        res.status(200).json(utils.formatHttpSuccess(sample));
    })
);

/**
 * @route   POST /
 * @desc    Creates a new entry based on the provided data
 * @param   {string} userId - User identifier provided in the request body
 * @returns {object} 201 - Success with the ID and URL of the new entry
 * @returns {object} 400 - Error if the userId field is missing
 */
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
        res.status(201).json(utils.formatHttpSuccess({ id, url: `/sample/${id}` }));
    })
);

// create or get one sample
router.post(
    '/retrieve', 
    asyncHandler(async (req, res) => {
        // --
        const { google_uid, google_name } = req.body;
        if (!google_uid) {
            res.status(400).json({ message: 'google_uid is required.' });
            return;
        }

        if (!google_name) {
            res.status(400).json({ status: 'error', data: { message: 'google_name is required.' } });
            return;
        }

        var result = await dao.getSampleContentOrCreate(req.base, google_uid, google_name);
        res.status(200).json(utils.formatHttpSuccess(result));
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

        let result = await dao.update(req.base, id, content);
        res.status(200).json(utils.formatHttpSuccess(result));
    })
);

// delete
router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        let result = await dao.delete(req.base, id);
        res.status(200).json(utils.formatHttpSuccess(result));
   })
);

module.exports = router;
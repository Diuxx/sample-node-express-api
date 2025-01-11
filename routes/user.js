'use strict';

// routes/user.js
const express = require('express');
const router = express.Router();
const dao = require('../data/user.dao');

// schemas
const userSchema = require('../schemas/user.schema');

// middlewares
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @route GET /
 * @description Fetches all records from the specified database and returns them as JSON.
 * 
 * @param {Object} req - HTTP request object.
 * @param {string} req.base - Database to fetch records from.
 * @param {Object} res - HTTP response object.
 * @returns {void}
 * 
 * @middleware asyncHandler - Handles async errors.
 * @throws {Error} - If dao.getAll fails.
 **/
router.get(
    '/', 
    asyncHandler(async (req, res) => {
        // --
        const results = await dao.getAll(req.base);
        res.status(200).json(results);
    })
);

/**
 * @route GET /:id
 * @description Retrieves a user by their ID.
 * 
 * @param {string} id - The ID of the user to retrieve.
 * @returns {Object} The user object with a success status.
 * @throws {Error} If retrieval fails, handled by asyncHandler.
 **/
router.get(
    '/:id', 
    asyncHandler(async (req, res) => {
        // --
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: 'id is required.' });
            return;
        }

        var user = await dao.getOne(req.base, id);

        res.json({ status: 'success', data: user });
    })
);

/**
 * @route POST /
 * @description Creates a new user.
 * @param {string} name - The name of the user to create.
 * @param {string} google_id - The Google ID associated with the user.
 * @returns {Object} The created user object with a success status.
 * @throws {Error} If creation fails, handled by asyncHandler.
 * @middleware validate(userSchema) - Validates the request body against the userSchema.
 **/
router.post(
    '/',
    validate(userSchema),
    asyncHandler(async (req, res) => {
        // --
        const { name, google_id } = req.body;
        const user = await dao.create(req.base, name, google_id);

        res.status(201).json({ status: 'success', data: user });
    })
);

/**
 * @route PUT /:id
 * @description Updates a resource (user) by its ID.
 * @param {string} id - The ID of the user to update.
 * @param {string} name - The new name to update the user with.
 * @returns {Object} The updated user object with a success status.
 * @throws {Error} If update fails, handled by asyncHandler.
 * @middleware validate(userSchema) - Validates the request body against the userSchema. 
 **/
router.put(
    '/:id',
    validate(userSchema),
    asyncHandler(async (req, res) => {
        // --
        const { id } = req.params;
        const { name } = req.body;

        const user = await dao.update(req.base, name, id);
        res.status(200).json({ status: 'success', data: user });
    })
);

/**
 * @route DELETE /:id
 * @description Deletes a resource by its ID.
 * @param {string} id - The ID of the resource to delete.
 * @returns {Object} Status of the operation (success).
 * @throws {Error} If deletion fails, handled by asyncHandler.
 **/
router.delete(
    '/:id', 
    asyncHandler(async (req, res) => {
        // --
        const { id } = req.params;

        await dao.delete(req.base, id)
        res.status(200).json({ status: 'success' });
    })
);

module.exports = router;
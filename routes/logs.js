'use strict'

// routes/logs.js
const express = require('express');
const router = express.Router();

// middlewares
const asyncHandler = require('../middleware/asyncHandler');

router.get(
    '/', 
    asyncHandler(async (req, res) => {
        // --
        res.status(200).json({ status: "success" });
    })
);

module.exports = router;
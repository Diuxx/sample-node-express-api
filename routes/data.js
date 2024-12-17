'use strict';

// routes/data.js
const express = require('express');
const router = express.Router();

// get 
router.get('/', async (req, res) => {
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
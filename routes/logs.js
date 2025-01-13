'use strict'

// routes/logs.js
const express = require('express');
const router = express.Router();
const { readFileSync } = require('fs');
const path = require('path');

// middlewares
const asyncHandler = require('../middleware/asyncHandler');

router.get(
    '/', 
    asyncHandler(async (req, res) => {
        // --
        const filePath = path.join(req.config.pathLog, req.config.logName);
        let data = readFileSync(filePath, 'utf-8');
        const htmlContent = `
        <html>
            <body>
                <pre>${data}</pre>
                <p>This is the end of the content.</p>
            </body>
        </html>
        `;
    
        res.status(200).send(htmlContent);
    })
);

module.exports = router;
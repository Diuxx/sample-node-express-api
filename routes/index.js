'use strict';

const cors = require('cors');
const fs = require('fs');
const path = require('path');
const listEndpoints = require('express-list-endpoints');

module.exports = (app) => {
    const data = require('../data')(app.config);
    const routesDirectory = path.join(__dirname, './');

    // HTTP queries middleware 
    app.use(cors({
        origin: app.config.allowedOrigins || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }));
    
    // load all api routes
    fs.readdirSync(routesDirectory).forEach((file) => {
        if (file.endsWith('.js') && !file.includes('index')) {
            // --
            const routeName = '/' + file.replace('.js', '');
            console.log(`[${app.config.name}][🚀] indexing route ${routeName}`);
            
            try {
                app.use(routeName, 
                    (req, res, next) => {
                        req.base = data; // inject database.
                        req.config = app.config;
                        next();
                    },    
                    require(path.join(routesDirectory, file))
                );
            }
            catch (err) {
                console.error(`[${app.config.name}][❌] Failed to load route ${routeName}: ${err.message}`);
            }
        }
    });

    app.use((err, req, res, next) => {
        app.logger.error(err);
        res.status(500).json({
            status: "error",
            data: {
                message: err.message || 'An unknown error occurred'
            }
        });
    });

    app.get('/', (req, res) => { 
        const endpoints = listEndpoints(app);
        const htmlContent = `
        <html>
            <head>
                <title>${app.config.name} v${app.config.version}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background-color: #f4f4f9;
                        color: #333;
                    }
                    h1, h2 {
                        color: #444;
                    }
                    ul {
                        list-style: none;
                        padding: 0;
                    }
                    li {
                        background: #fff;
                        margin: 5px 0;
                        padding: 10px;
                        border-radius: 5px;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }
                    li:hover {
                        background-color: #e6f7ff;
                    }
                    a {
                        color: #007bff;
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <h1>${app.config.name} v${app.config.version}</h1>
                <h2>Liste des routes disponibles :</h2>
                <ul>
                    ${endpoints
                        .map(
                            (endpoint) =>
                                `<li><strong>${endpoint.methods.join(', ')}</strong>: <a href="${endpoint.path}">${endpoint.path}</a></li>`
                        )
                        .join('')}
                </ul>
            </body>
        </html>
        `;

        res.send(htmlContent);
    });    
};
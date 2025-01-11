'use strict';

const cors = require('cors');
const fs = require('fs');
const path = require('path');

module.exports = (app) => {
    const data = require('../data')(app.config);

    // HTTP queries middleware 
    app.use(cors());
    const routesDirectory = path.join(__dirname, './');
    fs.readdirSync(routesDirectory).forEach((file) => { // Lire tous les fichiers dans le dossier routes
        if (file.endsWith('.js') && !file.includes('index')) { // Vérifier que le fichier est un fichier JavaScript
            // --
            const routeName = '/' + file.replace('.js', '');
            console.log(`[${app.config.name}][🚀] indexing route ${routeName}`)
            app.use(routeName, 
                (req, res, next) => {
                    req.base = data; // inject database.
                    next();
                },    
                require(path.join(routesDirectory, file))
            );
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
        // Récupérer les routes définies
        const routes = app._router.stack.filter(r => r.route).map(r => r.route.path);

        // Générer le contenu HTML
        const htmlContent = `
        <html>
            <head>
                <title>${app.config.name} v ${app.config.version}</title>
            </head>
            <body>
                <h1>${app.config.name} v ${app.config.version}</h1>
                <h2>Liste des routes disponibles :</h2>
                <ul>
                    ${routes.map(route => `<li>${route}</li>`).join('')}
                </ul>
            </body>
        </html>
        `;

        res.send(htmlContent);
    });    
};
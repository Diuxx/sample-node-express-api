'use strict';

const cors = require('cors');
const fs = require('fs');
const path = require('path');

module.exports = (app, config) => {
const data = require('../data')(config);

    app.use(cors());
    const routesDirectory = path.join(__dirname, './');

    // Lire tous les fichiers dans le dossier routes
    fs.readdirSync(routesDirectory).forEach((file) => {
        // Vérifier que le fichier est un fichier JavaScript
        if (file.endsWith('.js') && !file.includes('index')) {
            // --
            const routeName = '/' + file.replace('.js', '');
            console.log(`[${config.name}][🚀] indexing route ${routeName}`)

            app.use(routeName, 
                (req, res, next) => {
                    req.base = data; // inject database.
                    next();
                },    
                require(path.join(routesDirectory, file))
            );
        }
    });

    app.get('/', (req, res) => { 
        // Récupérer les routes définies
        const routes = app._router.stack
            .filter(r => r.route)  // Filtrer les éléments qui contiennent des routes
            .map(r => r.route.path); // Extraire le chemin des routes

        // Générer le contenu HTML
        const htmlContent = `
        <html>
            <head>
                <title>${config.name} v ${config.version}</title>
            </head>
            <body>
                <h1>${config.name} v ${config.version}</h1>
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
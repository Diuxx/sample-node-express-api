'use strict';

const cors = require('cors');
const fs = require('fs');
const path = require('path');

module.exports = (app, config) => {
const data = require('../data')(config);

    app.use(cors());
    app.get('/', (req, res) => {
        res.json({ 
            'app': config.name,
            'version': config.version
        });
    });
    const database = { data: [ { 'name': 'Nicolas' }, { 'name': 'Paul' } ]};
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
};
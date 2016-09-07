import sslRedirect from 'heroku-ssl-redirect';
import express from 'express';

import '../models/env';
import reactServer from './react-server';
import componentLibrary from './componentLibrary';
import webpack from './webpack';

/**
 * Express route config
 *
 * @param  {Object} app - Express instance
 * @return {Object} - Express app with routes
 */
export default function routeConfig(app) {
    webpack(app);

    if (process.env.HEROKU) {
        app.use(sslRedirect());
    }

    app.use('/component', componentLibrary);

    app.use('/assets', express.static('public/assets', {
        maxAge: '30 days',
    }));

    app.use('/', reactServer);
}

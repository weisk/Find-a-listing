/* eslint-disable no-console */

import env from 'dotenv';
env.config({ silent: true });

import express from 'express';
import homepage from './homepage-route';
import mappage from './map-route';
import { assetsByChunkName as webpack } from '../bin/webpack.json';
import sslRedirect from 'heroku-ssl-redirect';

export default function routeConfig(app) {
    // Global variables
    /* eslint-disable no-param-reassign */
    app.locals.webpack_manifest = webpack.manifest[0];
    app.locals.webpack_vendor = webpack.vendor[0];
    app.locals.webpack_app = webpack.app[0];
    app.locals.webpack_app_css = webpack.app[1];
    if (process.env.NODE_ENV === 'production') {
        app.locals.GA_ID = process.env.GA_ID;
    }
    /* eslint-enable no-param-reassign */

    // Routes
    app.use('/', homepage);
    app.use('/map', mappage);

    if (process.env.NODE_ENV !== 'production') {
        app.use(sslRedirect());
        app.use('/bin', express.static('./bin', { maxAge: '30 days' }));
    }
}

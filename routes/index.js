/* eslint-disable no-console */
import sslRedirect from 'heroku-ssl-redirect';
import express from 'express';

import reactServer from './react-server';
// import mapRoute from './map-route';

import '../models/env';
import { assetsByChunkName as webpack, publicPath } from 'webpackjson';

export default function routeConfig(app) {
    // Global variables
    /* eslint-disable no-param-reassign */
    console.log(`publicPath: ${publicPath}`);
    // app.locals.webpack_manifest = `${publicPath}${webpack.manifest[0]}`;
    app.locals.webpack_vendor = `${publicPath}${webpack.vendor[0]}`;
    app.locals.webpack_app = `${publicPath}${webpack.app[0]}`;
    // app.locals.webpack_app_css = `${publicPath}${webpack.app[1]}`;
    if (process.env.NODE_ENV === 'production') {
        app.locals.GA_ID = process.env.GA_ID;
    }
    /* eslint-enable no-param-reassign */

    // Routes
    app.use('/', mapRoute);
    app.use('/react', reactServer);

    if (process.env.NODE_ENV !== 'production') {
        app.use(sslRedirect());
        app.use('/bin', express.static('./bin', { maxAge: '30 days' }));
    }
}

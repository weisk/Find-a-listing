/* eslint-disable no-console */
import { readFileSync } from 'fs';
import path from 'path';

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
    if (process.env.NODE_ENV === 'production') {
        let manifestContents = readFileSync(`./public${publicPath}manifest.json`);
        manifestContents = JSON.parse(manifestContents);
        app.locals.webpack_manifest = JSON.stringify(manifestContents);
        app.locals.webpack_vendor = `${publicPath}${webpack.vendor}`;
        app.locals.webpack_app = `${publicPath}${webpack.app}`;
    } else {
        app.locals.webpack_vendor = `${publicPath}${webpack.vendor[0]}`;
        app.locals.webpack_app = `${publicPath}${webpack.app[0]}`;
    }
    // app.locals.webpack_app_css = `${publicPath}${webpack.app[1]}`;

    console.log(`vendor.js: ${app.locals.webpack_vendor}`);
    console.log(`app.js: ${app.locals.webpack_app}`);
    if (process.env.NODE_ENV === 'production') {
        app.locals.GA_ID = process.env.GA_ID;
    }
    /* eslint-enable no-param-reassign */

    // Routes
    app.use('/', reactServer);
    // app.use('/react', mapRoute);

    if (process.env.NODE_ENV !== 'production') {
        app.use(sslRedirect());
        app.use('/assets', express.static('./public', { maxAge: '30 days' }));
    }
}

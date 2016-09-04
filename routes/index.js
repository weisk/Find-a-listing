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
    let appJs;
    let vendorJs;
    if (process.env.NODE_ENV === 'production') {
        let manifestContents = readFileSync(`./public${publicPath}manifest.json`);
        manifestContents = JSON.parse(manifestContents);
        /* eslint-disable no-param-reassign */
        app.locals.webpack_manifest = JSON.stringify(manifestContents);
        app.locals.GA_ID = process.env.GA_ID;
        /* eslint-enable no-param-reassign */
        vendorJs = webpack.vendor;
        appJs = webpack.app;
    } else {
        vendorJs = webpack.vendor[0];
        appJs = webpack.app[0];
    }
    /* eslint-disable no-param-reassign */
    app.locals.webpack_vendor = `${publicPath}${vendorJs}`;
    app.locals.webpack_app = `${publicPath}${appJs}`;
    /* eslint-enable no-param-reassign */

    // Routes
    // app.use('/react', mapRoute);
    if (process.env.HEROKU) {
        app.use(sslRedirect());
    }
    app.use('/assets', express.static('public/assets', {
        maxAge: '30 days',
    }));
    app.use('/', reactServer);
}

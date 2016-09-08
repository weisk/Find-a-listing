/* eslint-disable no-console */

import { readFileSync } from 'fs';
/* eslint-disable no-unused-vars */
import { dim } from 'colors';
/* eslint-enable no-unused-vars */

import '../models/env';
/* eslint-disable import/no-extraneous-dependencies, import/imports-first, import/no-unresolved */
import { assetsByChunkName, publicPath } from 'webpackjson';
/* eslint-enable import/no-extraneous-dependencies, import/imports-first, import/no-unresolved */

/**
 * Get Webpack asset file paths and send to templates
 * @param  {Object} app Express instance
 * @return {null} Sets Express variables
 */
export default function webpack(app) {
    let appJs;
    let vendorJs;
    let commonJs;
    let appCss;
    if (process.env.NODE_ENV === 'production') {
        let manifestContents = readFileSync(`./public${publicPath}manifest.json`);
        manifestContents = JSON.parse(manifestContents);
        /* eslint-disable no-param-reassign */
        app.locals.webpack_manifest = JSON.stringify(manifestContents);
        app.locals.GA_ID = process.env.GA_ID;
        /* eslint-enable no-param-reassign */
        vendorJs = assetsByChunkName.vendor[0];
        appJs = assetsByChunkName.app[0];
        appCss = assetsByChunkName.app[1];
        commonJs = assetsByChunkName.common[0];
    } else {
        vendorJs = assetsByChunkName.vendor[0];
        appJs = assetsByChunkName.app[0];
        appCss = assetsByChunkName.app[1];
        commonJs = assetsByChunkName.common[0];
    }
    /* eslint-disable no-param-reassign */
    app.locals.webpack_vendor = `${publicPath}${vendorJs}`;
    app.locals.webpack_app = `${publicPath}${appJs}`;
    app.locals.webpack_app_css = `${publicPath}${appCss}`;
    app.locals.webpack_common = `${publicPath}${commonJs}`;
    /* eslint-enable no-param-reassign */

    console.log('Asset path:'.dim, publicPath);
}

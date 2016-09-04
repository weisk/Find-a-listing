/* eslint-disable no-console */
import path from 'path';
import express from 'express';
import handlebars from 'express-handlebars';
import fs from 'fs';
import spdy from 'spdy';
import helmet from 'helmet';
import compress from 'compression';
import minifyHTML from 'express-minify-html';

import './models/env';
import routeConfig from './routes/index.js';

console.log(`ENV: ${process.env.NODE_ENV}`);

// Server settings
const app = express();
const http2PortNumber = process.env.HTTP2PORT || 5000;
const http2Host = process.env.HTTP2HOST;

let sslKey = null;
let sslCrt = null;
let sslOptions = {};

if (process.env.NODE_ENV !== 'production') {
    sslKey = fs.readFileSync(process.env.SSL_KEY);
    sslCrt = fs.readFileSync(process.env.SSL_CRT);
    sslOptions = {
        key: sslKey,
        cert: sslCrt,
        sdpy: {
            ciphers: [
                'ECDHE-RSA-AES256-SHA384',
                'DHE-RSA-AES256-SHA384',
                'ECDHE-RSA-AES256-SHA256',
                'DHE-RSA-AES256-SHA256',
                'ECDHE-RSA-AES128-SHA256',
                'DHE-RSA-AES128-SHA256',
                'HIGH',
                '!aNULL',
                '!eNULL',
                '!EXPORT',
                '!DES',
                '!RC4',
                '!MD5',
                '!PSK',
                '!SRP',
                '!CAMELLIA',
            ].join(':'),
            honorCipherOrder: true,
        },
    };
}

if (process.env.NODE_ENV !== 'production') {
    const sslCa = fs.readFileSync(process.env.SSL_CA);
    sslOptions = Object.assign({}, sslOptions, {
        ca: sslCa,
    });
}

if (process.env.NODE_ENV !== 'production') {
    console.log('Helmet: enabled');
    app.use(helmet());
    app.use(helmet.hsts({
        maxAge: 31536000000,
        includeSubdomains: true,
        force: true,
    }));
    app.use(compress({ level: 9, threshold: 300 }));
} else {
    console.log('Helmet: disabled');
}

app.use(minifyHTML({
    override: true,
    displayErrors: process.env.NODE_ENV !== 'production',
    htmlMinifier: {
        removeComments: true,
        removeCommentsFromCDATA: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        preserveLineBreaks: false,
        removeAttributeQuotes: false,
        removeEmptyAttributes: false,
        minifyCSS: true,
        minifyJS: true,
    },
}));
app.set('port', http2PortNumber);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    defaultLayout: 'layout',
    extname: '.hbs',
    layoutsDir: 'views',
    partialsDir: 'views/partials',
}));


if (process.env.NODE_ENV === 'production') {
    app.listen(process.env.PORT, http2Host, () => {
        console.log(`HTTP:  http://${http2Host}:${process.env.PORT}`);
    });
} else {
    spdy.createServer(sslOptions, app).listen(http2PortNumber, http2Host, () => {
        console.log(`HTTP2:  https://${http2Host}:${http2PortNumber}`);
    });
}

// Define routes
routeConfig(app);

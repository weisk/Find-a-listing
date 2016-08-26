/* eslint-disable no-console */
import env from 'dotenv';
env.config({ silent: true });

import path from 'path';
import express from 'express';
import handlebars from 'express-handlebars';
import fs from 'fs';
import spdy from 'spdy';
import helmet from 'helmet';
import compress from 'compression';
import routeConfig from './routes/index.js';
import minifyHTML from 'express-minify-html';

// Server settings
const app = express();
const http2PortNumber = process.env.HTTP2PORT || 5000;
const http2Host = process.env.HTTP2HOST;
const sslKey = fs.readFileSync(process.env.SSL_KEY);
const sslCrt = fs.readFileSync(process.env.SSL_CRT);

let sslOptions = {
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

if (process.env.NODE_ENV === 'production') {
    const sslCa = fs.readFileSync(process.env.SSL_CA);
    sslOptions = Object.assign({}, sslOptions, {
        ca: sslCa,
    });
}

if (process.env.NODE_ENV === 'local') {
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

console.log(`ENV: ${process.env.NODE_ENV}`);
if (process.env.NODE_ENV === 'development') {
    app.listen(http2PortNumber, http2Host, () => {
        console.log(`HTTP:  http://${http2Host}:${http2PortNumber}`);
    });
} else {
    spdy.createServer(sslOptions, app).listen(http2PortNumber, http2Host, () => {
        console.log(`HTTP2:  https://${http2Host}:${http2PortNumber}`);
    });
}

// Define routes
routeConfig(app);

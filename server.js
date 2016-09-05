/* eslint-disable no-console */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import express from 'express';
import handlebars from 'express-handlebars';
import { createServer } from 'spdy';
import helmet, { hsts } from 'helmet';
import compress from 'compression';
import minifyHTML from 'express-minify-html';
import requestIp from 'request-ip';

import './models/env';
import routeConfig from './routes/index.js';

// Server settings
const app = express();
const http2PortNumber = process.env.HTTP2PORT || 5000;
const http2Host = process.env.HTTP2HOST;
const NODE_ENV = process.env.NODE_ENV;
console.log(`ENV: ${NODE_ENV}`);

app.use(helmet());
app.use(hsts({
    maxAge: 31536000000,
    includeSubdomains: true,
    force: true,
}));

app.use(compress({
    level: 9,
    threshold: 300,
}));

app.use(minifyHTML({
    override: true,
    displayErrors: NODE_ENV !== 'production',
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
app.set('views', resolve(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    defaultLayout: 'layout',
    extname: '.hbs',
    layoutsDir: 'views',
    partialsDir: 'views/partials',
}));

app.use(requestIp.mw());

/* eslint-disable no-case-declarations */
switch (NODE_ENV) {
    case 'local':
    case 'development':
        const sslKey = readFileSync(process.env.SSL_KEY);
        const sslCrt = readFileSync(process.env.SSL_CRT);
        const sslOptions = {
            key: sslKey,
            cert: sslCrt,
            sdpy: {
                ciphers: process.env.SSL_CIPHERS,
                honorCipherOrder: true,
            },
        };
        /* const sslCa = fs.readFileSync(process.env.SSL_CA);
        sslOptions = Object.assign({}, sslOptions, {
            ca: sslCa,
        });*/
        createServer(sslOptions, app).listen(http2PortNumber, http2Host, () => {
            console.log(`HTTP2:  https://${http2Host}:${http2PortNumber}`);
            console.log('Server running...');
        });
        break;
    case 'production':
    default:
        app.listen(process.env.PORT, http2Host, () => {
            console.log(`HTTP:  http://${http2Host}:${process.env.PORT}`);
            console.log('Server running...');
        });
}
/* eslint-disable no-case-declarations */

routeConfig(app);

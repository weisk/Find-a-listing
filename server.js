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
/* eslint-disable no-unused-vars */
import { green, dim, bold, yellow } from 'colors';
/* eslint-enable no-unused-vars */

import './models/env';
import routeConfig from './routes/index.js';

// Server settings
const app = express();
const http2Host = process.env.HTTP2HOST;
const NODE_ENV = process.env.NODE_ENV;
const http2PortNumber = NODE_ENV ? process.env.HTTP2PORT : process.env.PORT;
console.log('------------------------------'.yellow);
console.log('ENV:'.dim, `${NODE_ENV}`);

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

app.use((req, res, next) => {
    const clientIp = requestIp.getClientIp(req);
    /* eslint-disable no-param-reassign */
    req.clientIp = (clientIp === '127.0.0.1') ? process.env.IP : clientIp;
    /* eslint-enable no-param-reassign */
    next();
});

routeConfig(app);

let protocol;
/* eslint-disable no-case-declarations */
switch (NODE_ENV) {
    case 'local':
    case 'development':
        protocol = 'http2';
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
        createServer(sslOptions, app).listen(http2PortNumber, http2Host);
        break;
    case 'production':
    default:
        protocol = 'http';
        app.listen(process.env.PORT, http2Host);
}
/* eslint-disable no-case-declarations */

console.log('Protocol:'.dim, protocol);
console.log('URL:'.dim, `//${http2Host}:${http2PortNumber}`);
console.log('------------------------------'.yellow);
console.log(`${NODE_ENV} server running...`.green.bold);

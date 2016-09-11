/* eslint-disable no-console */
import { Router } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';

import routes from '../modules/routes';

const router = new Router();

router.get('*', (req, res) => {
    res.set('Cache-control', 'private, max-age=600');
    match({
        routes,
        location: req.url,
    }, (error, redirect, routerProps) => {
        if (error) {
            res.status(500).send(error.message);
        } else if (redirect) {
            res.redirect(`${redirect.pathname}${redirect.search}`);
        } else if (routerProps) {
            const appHtml = renderToString(
                <RouterContext {...routerProps} />
            );
            res.status(200).render('_reactServer', {
                title: 'React Server',
                appHtml,
            });
        } else {
            res.status(404).send('Not Found');
        }
    });
});

export { router as default };

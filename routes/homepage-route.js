/* eslint-disable no-console */

import express from 'express';

const router = new express.Router();

router.get('/', (req, res) => {
    res.set('Cache-control', 'private, max-age=600');
    res.status(200).render('_home', {
        title: 'Homepage',
    });
});

export { router as default };

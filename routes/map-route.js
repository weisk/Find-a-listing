/* eslint-disable no-console */

import express from 'express';
import Parser from 'dbf-parser';
import fs from 'fs';
import path from 'path';

const router = new express.Router();

router.get('/', (req, res) => {
    res.set('Cache-control', 'private, max-age=600');
    res.status(200).render('_map', {
        title: 'Map',
    });
});

export { router as default };

/* eslint-disable no-console */
import { Router } from 'express';

const router = new Router();

router.get('/', (req, res) => {
    res.set('Cache-control', 'private, max-age=600');
    res.status(200).render('_map', {
        title: 'Map',
    });
});

export { router as default };

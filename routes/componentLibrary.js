/* eslint-disable no-console */
import { Router } from 'express';

const router = new Router();

router.get('/', (req, res) => {
    res.set('Cache-control', 'private, max-age=600');
    res.status(200).render('componentLibrary/_react', {
        layout: 'componentLibrary/layout',
        title: 'Component Library',
    });
});

export { router as default };

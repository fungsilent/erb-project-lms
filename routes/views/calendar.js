import express from 'express';
const router = express.Router();

export default (app) => {
    router.get('/calendar', (req, res) => {
        res.render('calendar', { user: req.user });
    });

    app.use(router);
};

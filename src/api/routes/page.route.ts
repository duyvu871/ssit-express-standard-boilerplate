import { Router } from 'express';

const pageRouter = Router();

// Home page route (login/register page)
pageRouter.get('/', (req, res) => {
    res.render('home', {
        title: 'Authentication'
    });
});

// Dashboard page route
pageRouter.get('/dashboard', (req, res) => {
    res.render('dashboard', {
        title: 'User Dashboard'
    });
});

export default pageRouter;
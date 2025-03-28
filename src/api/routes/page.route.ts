import { Router } from 'express';
import { pageAuthenticate } from 'middlewares/page-authenticate';

const pageRouter = Router();

// Home page route (login/register page)
pageRouter.get('/', (req, res) => {
    res.render('home', {
        title: 'Authentication'
    });
});

// Dashboard page route
pageRouter.get('/dashboard', pageAuthenticate('/'), (req, res) => {
    res.render('dashboard', {
        title: 'User Dashboard'
    });
});

// File Manager page route
pageRouter.get('/file-manager', pageAuthenticate('/'), (req, res) => {
    res.render('file-manager', {
        title: 'File Manager'
    });
});

export default pageRouter;
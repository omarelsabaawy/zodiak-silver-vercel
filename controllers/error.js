exports.get404 = (req, res, next) => {
    return res.status(404).render('404', {
        pageTitle: '404 Page not found!',
        path: '/404',
        isAuth: req.session.isLoggedIn,
        isManager: req.session.isManager,
        user: req.user
    });
};

exports.get500 = (req, res, next) => {
    return res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuth: req.session.isLoggedIn,
        isManager: req.session.isManager,
        user: req.user
    });
};
module.exports = (req, res, next) => {
    if (req.user.cart == {}) {
        return res.redirect('/cart');
    }
};
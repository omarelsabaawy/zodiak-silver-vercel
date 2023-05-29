const Product = require('../models/product');
const Order = require('../models/order');
const fileHelper = require('../util/file');

exports.getManageProducts = (req, res, next) => {
    Product
        .find()
        .then(products => {
            return res.render('manage-product', {
                pageTitle: 'Manage products',
                path: '/manage-products',
                isAuth: req.session.isLoggedIn,
                isManager: req.session.isManager,
                user: req.user,
                products: products
            });
        })
        .catch(err => { console.log(err); });
};

exports.getAddProducts = (req, res, next) => {
    return res.render('edit-product', {
        pageTitle: 'Add new product',
        path: '/add-products',
        isAuth: req.session.isLoggedIn,
        user: req.user,
        ImageError: false,
        editing: false
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const quantity = req.body.quantity;
    const category = req.body.category;
    const gender = req.body.gender;

    if (!image) {
        return res.render('edit-product', {
            pageTitle: 'Add new product',
            path: '/add-products',
            isAuth: req.session.isLoggedIn,
            user: req.user,
            ImageError: true,
            editing: false
        });
    }

    const imageUrl = image.path;

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        quantity: quantity,
        category: category,
        gender: gender,
        userId: req.session.user
    });
    product
        .save()
        .then(result => {
            res.redirect('/admin/manage-products');
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getEditProduct = (req, res, next) => {
    Product
        .find()
        .then(products => {
            const editMode = req.query.edit;
            if (!editMode) {
                return res.redirect('/');
            }
            const prodId = req.params.productId;
            Product.findById(prodId)
                .then(product => {
                    if (!product) {
                        return res.redirect('/');
                    }
                    res.render('edit-product', {
                        products: products,
                        pageTitle: 'Edit Product',
                        path: '/edit-product',
                        editing: editMode,
                        product: product,
                        ImageError: false,
                        isAuth: req.session.isLoggedIn,
                        isManager: req.session.isManager,
                        user: req.user
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(err => { console.log(err); })
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description;
    const updatedQuantity = req.body.quantity;
    const updatedCat = req.body.category;
    const updatedGender = req.body.gender;

    Product.findById(prodId)
        .then(product => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDesc;
            if (image) {
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }
            product.category = updatedCat;
            product.quantity = updatedQuantity;
            product.category = updatedCat;
            product.gender = updatedGender;
            return product.save();
        })
        .then(result => {
            res.redirect('/admin/manage-products');
        })
        .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return next(new Error('Product not found.'));
            }
            fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({ _id: prodId, userId: req.user._id });
        })
        .then(() => {
            console.log('DESTROYED PRODUCT');
            res.redirect('/admin/manage-products');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getOrders = (req, res, next) => {
    Order
        .find()
        .then(orders => {
            res.render('viewOrders', {
                pageTitle: 'Orders',
                path: '/all-orders',
                orders: orders,
                isAuth: req.session.isLoggedIn,
                isManager: req.session.isManager,
                user: req.user
            });
        })
        .catch(err => {
            console.log(err);
        });
}

exports.deleteOrder = (req, res, next) => {
    const orderId = req.body.orderId;
    Order.findByIdAndRemove(orderId)
        .then(() => {
            res.redirect('/admin/all-orders');
        })
        .catch(err => console.log(err));
};

exports.getOrder = (req, res, next) => {
    const orderId = req.params.orderId;
    let shipping = 0;
    const towns = new Map([
        ['cairo', true],
        ['giza', true],
    ]);
    Order
        .findById(orderId)
        .then(order => {
            if (towns.has((order.town).toLowerCase())) {
                shipping += 40;
            } else {
                shipping += 60;
            }
            return res.render('order', {
                pageTitle: 'Order number' + orderId,
                header: 'Order number' + orderId,
                message: 'This order was placed.',
                path: '/order',
                isAuth: req.session.isLoggedIn,
                isManager: req.session.isManager,
                products: order.products,
                user: req.user,
                totalPrice: order.totalPrice,
                shipping: shipping,
                orderResult: order
            });
        })
        .catch(err => {
            console.log(err);
        });
};
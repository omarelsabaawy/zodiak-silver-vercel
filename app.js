const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const compression = require('compression');
const helmet = require('helmet');


const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://Zodiak-silver-main:zodikSilver@cluster0.jbqvwty.mongodb.net/Zodiak-silver-main';

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

const checkIfImage = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const fileStorageLocation = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
    destination: (req, file, cb) => {
        cb(null, 'images');
    }
});

app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('views', path.join(__dirname, 'views'))

app.use(helmet());
app.use(compression());

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/order');


app.use(multer({ storage: fileStorageLocation, fileFilter: checkIfImage }).single('image'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(adminRoutes);
app.use(shopRoutes);
app.use(userRoutes);
app.use(orderRoutes);

app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(500);
    return res.render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuth: req.session.isLoggedIn,
        isManager: req.session.isManager,
        user: req.user
    });
});

app.use(errorController.get404);

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        console.log('connected');
        app.listen(process.env.PORT || 8000);
    })
    .catch(err => {
        console.log(err);
    });

module.exports = app;

const express = require("express");
const router = require("router");
const exphbs = require("express-handlebars");
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const morgan = require('morgan');
const flash = require('connect-flash');
const cors = require('cors');

const fs = require('fs');
const postit = require('./models/postit.js');
const User = require('./models/user');
const room = require('./models/room');

const app = express();
require('./database');
require('./passport/local-auth');
require('dotenv').config({path: __dirname + '/config/.secrets'});

app.set('port', process.env.PORT || 3000);

const ifEqu = (arg1, arg2, options) => {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
}

app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'index',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: { ifEqu: ifEqu }
}));
app.set('view engine', '.hbs');

app.use(morgan('dev'));
//app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'sockets')));
app.use(session({
    secret: 'key',
    resave: false,
    saveUninitialized: true,
    cokkie: { secure: true }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.error = req.flash('error');
    next();
});

app.use('', require('./routes/login'));
app.use('', require('./routes/routes'));

const server = app.listen(app.get('port'), () => {
    console.log(`Server on ${app.get('port')}`);
});
const io = require('socket.io')(server);
require('./sockets/socketBE')(io);


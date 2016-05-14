var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var constants = require('./values/constants');
var expressSession = require('express-session');
var mongoStore = require("connect-mongo")(expressSession);

var passport = require('passport');


//database configuration
var CONST = require('./values/constants');
var mongoose = require('mongoose');
mongoose.connect(CONST.url);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('jade', require('jade').__express);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//use expresssession
app.use(expressSession({
    secret: '1c8607ad-4484-493b-85b2-bb5949051e38',
    resave: false,  //don't save session if unmodified
    saveUninitialized: false,	// don't create session until something stored
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    store: new mongoStore({
        url: constants.url
    })
}));
app.use(passport.initialize());
app.use(passport.session());

//Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var auth = require('./util/auth');
auth.init(passport);

app.use('/', require('./routes/index')(passport));
app.use('/admin', require('./routes/admin')(passport));
app.use('/sensor', require('./routes/sensor'));
app.use('/user', require('./routes/user'));
app.use('/virtualSensor', require('./routes/virtual-sensor'));
app.use('/collector', require('./routes/collector'));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    log.i('err = ', err.stack);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

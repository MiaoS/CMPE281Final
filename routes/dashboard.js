var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongo = require('../util/mongodb');
var log = require('../util/log');
var CONST = require('../values/constants');

var isAuthenticated = function (req, res, next) {
    req.isAuthenticated() ? next() : res.redirect('/');
};

router.get('/', isAuthenticated, function (req, res) {
    log.req(req);
    mongo.get({}, CONST.VIRTUAL_SENSOR).then(function (sensors) {
        log.v('sensors = ', sensors);
        if (sensors.length){
            res.render('dashboard.jade', {user: req.user});
        }else{
            res.render('dashboard_empty.jade', {user: req.user});
        }
    })
});

module.exports = router;
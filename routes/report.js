var express = require('express');
var router = express.Router();
var passport = require('passport');
var log = require('../util/log');

var isAuthenticated = function (req, res, next) {
    req.isAuthenticated() ? next() : res.redirect('/');
};

router.get('/', isAuthenticated, function (req, res) {
    res.render('report.jade', {user: req.user});
});

router.get('/vsid/:vsid', isAuthenticated, function (req, res) {
    log.req(req);
    res.render('report.jade', {user: req.user, vsid: req.params.vsid});
});

module.exports = router;
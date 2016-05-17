var express = require('express');
var router = express.Router();
var passport = require('passport');
var log = require('../util/log');

var isAuthenticated = function (req, res, next) {
    req.isAuthenticated() ? next() : res.redirect('/');
};

router.get('/', isAuthenticated, function (req, res) {
    res.render('manage-vs.jade', {user: req.user});
});

module.exports = router;
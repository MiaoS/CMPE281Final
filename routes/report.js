var express = require('express');
var router = express.Router();
var passport = require('passport');
var log = require('../util/log');

var isAuthenticated = function (req, res, next) {
    req.isAuthenticated() ? next() : res.redirect('/');
};

module.exports = function (passport) {

    router.get('/', isAuthenticated, function (req, res) {
        res.render('report.jade', {user: req.user});
    });

    router.get('/vsid/:vsid', isAuthenticated, function (req, res) {
        res.render('report.jade', {user: req.user, vsid: req.params.vsid});
    });


    return router;
}
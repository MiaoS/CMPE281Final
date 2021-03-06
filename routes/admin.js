var express = require('express');
var router = express.Router();
var passport = require('passport');
var log = require('../util/log');

var isAuthenticated = function (req, res, next) {
    req.isAuthenticated() ? next() : res.redirect('/');
};

module.exports = function (passport) {

    /* GET login page. */
    router.get('/', function (req, res) {
        // Display the Login page with any flash message, if any
        if (req.isAuthenticated()) {
            res.redirect(req.baseUrl + '/dashboard');
        } else {
            res.redirect(req.baseUrl + '/signin');
        }
    });

    /* GET login Page */
    router.get('/signin', function (req, res) {
        res.render('signin', {message: req.flash('message')});
    });

    /* Handle Signin POST */
    router.post('/signin', passport.authenticate('signin', {
        successRedirect: '/admin/dashboard',
        failureRedirect: '/admin/signin',
        failureFlash: true
    }));


    /* GET Registration Page */
    router.get('/signup', function (req, res) {
        res.render('signup', {message: req.flash('message')});
    });

    /* Handle Registration POST */
    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/admin/dashboard',
        failureRedirect: '/admin/signup',
        failureFlash: true
    }));

    /* GET Home Page */
    router.get('/dashboard', isAuthenticated, function (req, res) {
        res.render('manage-sensor.jade', {user: req.user});
    });

    /* GET setting Page */
    router.get('/setting', isAuthenticated, function (req, res) {
        res.render('setting', {user: req.user});
    });
    /* GET help Page */
    router.get('/help', isAuthenticated, function (req, res) {
        res.render('help', {user: req.user});
    });
    /* GET profile Page */
    router.get('/profile', isAuthenticated, function (req, res) {
        res.render('profile', {user: req.user});
    });
    /* Handle Logout */
    router.get('/signout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    return router;
}
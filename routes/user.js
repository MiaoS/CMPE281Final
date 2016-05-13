'use strict';

var express = require('express');
var router = express.Router();
var passport = require('passport');

var isAuthenticated = function (req, res, next) {
    req.isAuthenticated() ? next() : res.redirect('/');
};

module.exports = function (passport) {

    /* GET login page. */
    router.get('/', function (req, res) {
        // Display the Login page with any flash message, if any
        res.render('index', {
            message: req.flash('message'),
            isAuthenticated: req.isAuthenticated(),
            user: req.user
        });
    });

    /* GET login Page */
    router.get('/signin', function (req, res) {
        res.render('signin', {message: req.flash('message')});
    });

    /* Handle Signin POST */
    router.post('/signin', passport.authenticate('signin', {
        successRedirect: '/dashboard',
        failureRedirect: '/signin',
        failureFlash: true
    }));


    /* GET Registration Page */
    router.get('/signup', function (req, res) {
        res.render('signup', {message: req.flash('message')});
    });

    /* Handle Registration POST */
    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/dashboard',
        failureRedirect: '/signup',
        failureFlash: true
    }));
    
    router.get('/signout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    return router;
}
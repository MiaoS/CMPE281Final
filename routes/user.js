var express = require('express');
var mongo = require('../util/mongodb');
var log = require('../util/log');
var ERROR = require('../values/error');
var util = require('../util/util');
var auth = require('../util/auth');
var collector = require('../routes/collector');
var _ = require('underscore');
var CONSTANTS = require('../values/constants');
var rp = require('request-promise');
var router = express.Router();

router.get('/me', function (req, res, next) {
    return mongo.get(req.user._id, CONSTANTS.USER).spread(function (user) {
        ERROR.ok(res, user);
    })
});

module.exports = router;

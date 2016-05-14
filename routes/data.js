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

router.get('/', function (req, res, next) {
    return mongo.get({}, CONSTANTS.DATA).then(function (data) {
        ERROR.ok(res, data);
    })
});

router.get('/vsid/:vsid', function (req, res, next) {
    log.req(req);
    return mongo.get({vsid: req.params.vsid}, CONSTANTS.DATA).then(function (data) {
        ERROR.ok(res, data);
    }).catch(function (err) {
        ERROR.badRequest(err);
    });
});

router.post('/', function (req, res, next) {
    log.req(req);
    var sensor = req.body;
    return mongo.get({lat: sensor.lat, lng: sensor.lng}, CONSTANTS.SENSOR).bind({}).spread(function (result) {
        if (result) {
            log.i('post sensor, duplicated item, sensor = ', sensor);
            throw ERROR.DUP_SENSOR;
        }
        sensor.uid = req.user._id.toString();
        return mongo.put(sensor, CONSTANTS.SENSOR);
    }).then(function (result) {
        this.sensor = result;
        log.i('post sensor, insert sensor, result = ', result);
        return ERROR.ok(res, this.sensor);
    }).catch(function (err) {
        ERROR.badRequest(res, err);
    });
});

router.delete('/:sid', function (req, res, next) {
    log.req(req);
    return mongo.remove(req.params.sid, CONSTANTS.SENSOR).then(function () {
        return ERROR.ok(res, '');
    }).catch(function (err) {
        ERROR.badRequest(res, err);
    });
});


module.exports = router;

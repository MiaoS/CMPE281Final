var express = require('express');
var mongo = require('../util/mongodb');
var log = require('../util/log');
var ERROR = require('../values/error');
var util = require('../util/util');
var auth = require('../util/auth');
var _ = require('underscore');
var CONSTANTS = require('../values/constants');
var rp = require('request-promise');
var Promise = require('bluebird');
var router = express.Router();

router.get('/my', function (req, res, next) {
    log.req(req);
    return mongo.get({uid: req.user._id.toString()}, CONSTANTS.VIRTUAL_SENSOR_GROUP).then(function (sensors) {
        ERROR.ok(res, sensors);
    })
});

router.get('/:sid', function (req, res, next) {
    return mongo.get(req.params.sid, CONSTANTS.VIRTUAL_SENSOR).spread(function (sensor) {
        ERROR.ok(res, sensor);
    })
});

router.post('/', function (req, res, next) {
    log.req(req);

    return Promise.bind({}).then(function () {
        log.v();
        if (req.body._id) {
            log.v();
            return mongo.get(req.body._id, CONSTANTS.VIRTUAL_SENSOR_GROUP);
        }
        log.v();
        return [];
    }).spread(function (vsg) {
        log.v();
        if (!vsg) {
            log.v('+ vsg');
            vsg = util.copy(req.body);
            vsg.uid = req.user._id.toString();
        } else {
            log.v();
            util.setProperties(vsg, req.body);
        }
        vsg.samplingInterval = Math.max(CONSTANTS.MIN_SAMPLING_INTERVAL, vsg.samplingInterval || 30);
        log.v('* vsg, vsg = ', vsg);
        return mongo.put(vsg, CONSTANTS.VIRTUAL_SENSOR_GROUP);
    }).then(function (result) {
        log.v();
        this.vsg = result;
        log.i('* vsg, insert sensor group, result = ', result);
        return ERROR.ok(res, this.vsg);
    }).then(function () {
    }).catch(function (err) {
        ERROR.badRequest(res, err);
    });
});

router.delete('/:gid', function (req, res, next) {
    log.req(req);
    return mongo.remove(req.params.gid, CONSTANTS.VIRTUAL_SENSOR_GROUP).then(function () {
        return ERROR.ok(res, ERROR.OK);
    }).then(function () {
    }).catch(function (err) {
        ERROR.badRequest(res, err);
    });
});

module.exports = router;

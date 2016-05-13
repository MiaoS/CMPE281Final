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

function getUserObject(req) {
    log.req(req);
    return mongo.get({key: req.user._id.toString()}, CONSTANTS.CONFIG).spread(function (result) {
        log.i('getUserObject(), result = ', result);
        return result ? result : mongo.put({key: req.user._id.toString()}, CONSTANTS.CONFIG);
    });
}

router.get('/', function (req, res, next) {
    log.req(req);
    return mongo.get(req.query || {}, CONSTANTS.VIRTUAL_SENSOR, {sid: CONSTANTS.SENSOR}).then(function (sensors) {
        ERROR.ok(res, sensors);
    })
});

router.get('/my', function (req, res, next) {
    log.req(req);
    return mongo.get({uid: req.user._id.toString()}, CONSTANTS.VIRTUAL_SENSOR, {sid: CONSTANTS.SENSOR}).then(function (sensors) {
        ERROR.ok(res, sensors);
    })
});

router.get('/available', function (req, res, next) {
    log.req(req);
    return mongo.get({uid: req.user._id.toString()}, CONSTANTS.VIRTUAL_SENSOR)
        .bind({}).then(function (sensors) {
            this.mySensors = sensors;
            return mongo.get({}, CONSTANTS.SENSOR);
        }).then(function (allSensors) {
            var mySids = _.pluck(this.mySensors, 'sid');
            var allSids = _.pluck(allSensors, '_id');
            allSids = _.map(allSids, sid => sid.toString());
            var sids = _.difference(allSids, mySids);
            log.v('available, my = ', mySids, ', all = ', allSids, ', diff = ', sids);
            return mongo.get(sids, CONSTANTS.SENSOR);
        }).then(function (sensors) {
            ERROR.ok(res, sensors.toArray());
        })
});

router.get('/:sid', function (req, res, next) {
    return mongo.get(req.params.sid, CONSTANTS.VIRTUAL_SENSOR).spread(function (sensor) {
        ERROR.ok(res, sensor);
    })
});

router.post('/', function (req, res, next) {
    log.req(req);
    var sensor = req.body;
    return mongo.get({
        sid: sensor.sid,
        uid: req.user._id.toString()
    }, CONSTANTS.VIRTUAL_SENSOR).bind({}).spread(function (result) {
        if (result) {
            log.i('post sensor, duplicated item, sensor = ', sensor);
            throw ERROR.DUP_SENSOR;
        }
        sensor.uid = req.user._id.toString();
        return mongo.put(sensor, CONSTANTS.VIRTUAL_SENSOR);
    }).then(function (result) {
        this.sensor = result;
        log.i('post sensor, insert sensor, result = ', result);
        return ERROR.ok(res, this.sensor);
    }).catch(function (err) {
        ERROR.badRequest(res, err);
    });
});

router.delete('/:vsid', function (req, res, next) {
    log.req(req);
    return mongo.remove(req.params.vsid, CONSTANTS.VIRTUAL_SENSOR).then(function () {
        return ERROR.ok(res, ERROR.OK);
    }).catch(function (err) {
        ERROR.badRequest(res, err);
    });
});

module.exports = router;

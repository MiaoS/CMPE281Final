var express = require('express');
var Promise = require('bluebird');
var router = express.Router();
var mongo = require('../util/mongodb');
var log = require('../util/log');
var CONSTANTS = require('../values/constants');
var util = require('../util/util');
var ERROR = require('../values/error');

var schedules = {};
router.get('/', function (req, res, next) {
    log.req(req);
    res.send('');
});

router.post('/schedule/:vsid', function (req, res, next) {
    log.req(req);
    mongo.get(req.params.vsid, CONSTANTS.VIRTUAL_SENSOR, {sid: CONSTANTS.SENSOR}).spread(function (vs) {
        log.v('* schedule, vs = ', vs);
        if (vs.status == 'true') {
            startSampling(vs);
        } else {
            stopSampling(vs);
        }
    }).then(function () {
        ERROR.ok(res, ERROR.OK);
    }).catch(function (err) {
        log.e(err);
        ERROR.badRequest(res, ERROR.FAILED_ADD_SCHEDULE);
    });
});

router.delete('/schedule/:vsid', function (req, res, next) {
    log.req(req);
    stopSampling(req.params.vsid);
    ERROR.ok(res, ERROR.OK);
});

router.post('/startAllSchedule', function (req, res, next) {
    log.req(req);
    return mongo.get({status: 'true'}, CONSTANTS.SCHEDULE).then(function (schedules) {
        schedules.forEach(function (schedule) {
            sampling(schedule);
        });
    }).then(function () {
        ERROR.ok(res, '');
    });
});

function startSampling(vs) {
    log.i('sampling, vs = ', vs);
    stopSampling(vs);
    schedules[vs._id.toString()] = setInterval(function () {
        takeASample(vs);
    }, vs.samplingInterval * 1000);
}

function stopSampling(vs) {
    if (util.isString(vs)) {
        vs = {_id: vs};
    }
    if (schedules[vs._id.toString()]) {
        log.i('stopSampling, vs = ', vs);
        clearInterval(schedules[vs._id.toString()]);
    }
}

function takeASample(vs) {
    log.v('takeASample, vs = ', vs);
    Promise.bind({}).then(function () {
        var data = {
            temp: Math.floor(40 + Math.random() * 40),
            unit: 'f',
            lat: vs.s.lat,
            lng: vs.s.lng,
            collectedTime: Date.now()
        };
        return mongo.put(data, vs._id.toString());
    }).then(function (result) {
    }).catch(function (err) {
    });
}

module.exports = router;

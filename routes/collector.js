var express = require('express');
var router = express.Router();
var mongo = require('../util/mongodb');
var log = require('../util/log');
var CONSTANTS = require('../values/constants');
var util = require('../util/util');
var ERROR = require('../values/error');


router.get('/', function (req, res, next) {
    log.req(req);
    res.send('');
});

router.handlePostSchedule = function (form) {
    log.v('post schedule, form = ', form);
    return mongo.get(form.sid, CONSTANTS.SCHEDULE).spread(function (schedule) {
        log.v('post schedule, get schedule = ', schedule);
        if (!schedule) {
            schedule = {key: form.sid};
        }
        for (var attr in form) {
            if (attr !== '_id' || attr !== 'key') {
                schedule[attr] = form[attr];
            }
        }
        schedule.samplingInterval = Math.max(5, form.samplingInterval || 0);
        log.v('post schedule, schedule = ', schedule);
        return mongo.put(schedule, CONSTANTS.SCHEDULE);
    }).then(function (result) {
        if (result.status === 'true') {
            sampling(result);
        }
    });
};

router.handleDeleteSchedule = function (sid) {
    log.v('post schedule, sid = ', sid);
    return mongo.get(form.sid, CONSTANTS.SCHEDULE).spread(function (schedule) {
        log.v('post schedule, get schedule = ', schedule);
        if (!schedule) {
            schedule = {key: form.sid};
        }
        for (var attr in form) {
            if (attr !== '_id' || attr !== 'key') {
                schedule[attr] = form[attr];
            }
        }
        schedule.samplingInterval = Math.max(5, form.samplingInterval || 0);
        log.v('post schedule, schedule = ', schedule);
        return mongo.put(schedule, CONSTANTS.SCHEDULE);
    }).then(function (result) {
        if (result.status === 'true') {
            sampling(result);
        }
    });
};

router.post('/schedule', function (req, res, next) {
    log.req(req);

    router.handlePostSchedule(req.body).then(function () {
        ERROR.ok(res, '');
    }).catch(function (err) {
        log.e(err);
        ERROR.badRequest(res, ERROR.FAILED_ADD_SCHEDULE);
    });
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

function sampling(schedule) {
    log.i('sampling schedule, schedule = ', schedule);
    setInterval(function () {
        execute(schedule);
    }, schedule.samplingInterval * 1000);
}
router.sampling = sampling;

function execute(schedule) {
    log.v('execute, schedule = ', schedule);
    mongo.get(schedule.sid, CONSTANTS.SENSOR).then(function (sensor) {
        var data = {
            temp: Math.floor(40 + Math.random() * 40),
            unit: 'f',
            lat: sensor.lat,
            lng: sensor.lng,
            collectedTime: Date.now()
        };
        return mongo.put(data, schedule.sid);
    }).then(function (result) {

    }).catch(function (err) {

    });
}

module.exports = router;

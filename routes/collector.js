"use strict";
var express = require('express');
var Promise = require('bluebird');
var router = express.Router();
var mongo = require('../util/mongodb');
var log = require('../util/log');
var CONSTANTS = require('../values/constants');
var util = require('../util/util');
var ERROR = require('../values/error');
var querystring = require('querystring');
var rp = require('request-promise');

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
            startSampling(schedule);
        });
    }).then(function () {
        ERROR.ok(res, '');
    });
});

router.get('/station/:stationId', function (req, res, next) {
    log.req(req);
    fetchSensorData(req.params.stationId).then(function (data) {
        return ERROR.ok(res, data);
    }).catch(function (err) {
        return ERROR.badRequest(res, err);
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

var parse = Promise.promisify(require('csv-parse'));

function fetchSensorData(stationId) {
    var url = 'http://sdf.ndbc.noaa.gov/sos/server.php?';
    url += querystring.stringify({
        service: 'SOS',
        request: 'GetObservation',
        version: '1.0.0',
        offering: stationId,
        observedProperty: 'waves',
        responseformat: 'text/csv',
    });
    log.v('fetchSensorData, url = ', url);
    return rp({
        uri: url,
        method: 'get',
    }).then(function (body) {
        log.v('fetchSensorData, body = ', body);
        return parse(body);
    }).then(function (result) {
        log.v('fetchSensorData, result.length = ', result.length);
        if (result.length < 2) {
            return;
        }
        var data = {};
        for (var i = 0; i < result[0].length; ++i) {
            data[result[0][i]] = result[1][i];
        }
        for (var attr in data) {
            if (attr == 'station_id') {
                data.stationId = data[attr];
            } else if (attr.toLowerCase().startsWith('latitude')) {
                data.lat = data[attr];
            } else if (attr.toLowerCase().startsWith('longitude')) {
                data.lng = data[attr];
            }
        }
        return data;
    }).catch(function (err) {
        log.v(err.stack);
    });
}


function takeASample(vs) {
    log.v('takeASample, vs = ', vs);
    Promise.bind({}).then(function () {
        return fetchSensorData(vs.s.stationId);
    }).then(function (data) {
        data.sid = vs.sid;
        data.vsid = vs._id.toString();
        return mongo.put(data, CONSTANTS.DATA);
    }).catch(function (err) {
        log.e(err);
    });
}


module.exports = router;

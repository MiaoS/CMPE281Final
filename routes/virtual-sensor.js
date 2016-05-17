var express = require('express');
var mongo = require('../util/mongodb');
var log = require('../util/log');
var ERROR = require('../values/error');
var util = require('../util/util');
var auth = require('../util/auth');
var _ = require('underscore');
var CONSTANTS = require('../values/constants');
var rp = require('request-promise');
var router = express.Router();

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
    return mongo.get({
        sid: req.body.sid,
        uid: req.user._id.toString()
    }, CONSTANTS.VIRTUAL_SENSOR).bind({}).spread(function (vs) {
        if (!vs) {
            log.v('+ vs');
            vs = util.copy(req.body);
            vs.uid = req.user._id.toString();
        } else {
            util.setProperties(vs, req.body);
        }
        vs.samplingInterval = Math.max(CONSTANTS.MIN_SAMPLING_INTERVAL, vs.samplingInterval || 10);
        log.v('* vs, vs = ', vs);
        return mongo.put(vs, CONSTANTS.VIRTUAL_SENSOR);
    }).then(function (result) {
        this.vs = result;
        log.i('* vs, insert sensor, result = ', result);
        return ERROR.ok(res, this.vs);
    }).then(function () {
        return updateSchedule(this.vs._id.toString());
    }).catch(function (err) {
        ERROR.badRequest(res, err);
    });
});

router.delete('/:vsid', function (req, res, next) {
    log.req(req);
    return mongo.remove(req.params.vsid, CONSTANTS.VIRTUAL_SENSOR).then(function () {
        return ERROR.ok(res, ERROR.OK);
    }).then(function () {
        return removeSchedule(req.params.vsid);
    }).catch(function (err) {
        ERROR.badRequest(res, err);
    });
});

function updateSchedule(vsid) {
    rp({
        uri: 'http://localhost:' + CONSTANTS.PORT_COLLECTOR + '/collector/schedule/' + vsid,
        method: 'POST',
    }).then(function (body) {
    });
}
function removeSchedule(vsid) {
    rp({
        uri: 'http://localhost:' + CONSTANTS.PORT_COLLECTOR + '/collector/schedule/' + vsid,
        method: 'delete',
    }).then(function () {
    });
}
module.exports = router;

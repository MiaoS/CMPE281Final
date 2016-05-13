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
    return mongo.get({}, CONSTANTS.SENSOR).then(function (sensors) {
        ERROR.ok(res, sensors);
    })
});

router.get('/me', function (req, res, next) {
    return mongo.get(req.user._id, CONSTANTS.USER).spread(function (user) {
        ERROR.ok(res, user);
    })
});

router.get('/:sid', function (req, res, next) {
    return mongo.get(req.params.sid, CONSTANTS.SENSOR).spread(function (sensor) {
        ERROR.ok(res, sensor);
    })
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
//
//
// function getAllSensorIds() {
//     return mongo.get({}, CONSTANTS.SENSOR).then(function (sensors) {
//         return _.pluck(sensors, '_id');
//     });
// }
//
// const DEFAULT_POOL_NAME = 'defaultPool';
// function getDefaultPool() {
//     return mongo.get(DEFAULT_POOL_NAME, CONSTANTS.POOL).spread(function (pool) {
//         return pool ? pool : getAllSensorIds().then(function (sids) {
//             return mongo.put({key: DEFAULT_POOL_NAME, sids: sids}, CONSTANTS.POOL);
//         });
//     });
// }
//
// function getPoolAvailableSensors(req, pool) {
//     return getUserObject(req).then(function (object) {
//         var availableIds = util.arraySubtract(pool.sids, object.registeredIds);
//         log.i('getPoolAvailableSensors(), availableIds = ', availableIds, ', pool.sids = ', pool.sids,
//             ', object.registeredIds = ', object.registeredIds);
//         return mongo.get(availableIds, CONSTANTS.SENSOR);
//     });
// }
//
// function getUserAvailableSensors(req, res) {
//     log.req(req);
//     return mongo.get({uid: req.user._id.toString()}, CONSTANTS.VIRTUAL_SENSOR).then(function (vses) {
//
//     });
//     return getUserObject(req).bind({}).then(function (object) {
//         log.v('getUserObject, object = ', object);
//         this.object = object;
//         object.pool = object.pool || DEFAULT_POOL_NAME;
//         return mongo.get(object.pool, CONSTANTS.POOL);
//     }).spread(function (pool) {
//         if (!pool && this.object.pool == DEFAULT_POOL_NAME) {
//             return getDefaultPool();
//         }
//         return pool;
//     }).then(function (pool) {
//         log.i('getUserAvailableSensors(), poolId = ', this.object.pool, ', ids = ', pool.sids);
//         return getPoolAvailableSensors(req, pool);
//     }).then(function (sensors) {
//         log.i('getUserAvailableSensors(), sensors = ', sensors);
//         ERROR.ok(res, sensors.toArray());
//     });
// }
// router.get('/available', auth.nextOrRedirect, getUserAvailableSensors);
//
// router.post('/registered', function (req, res) {
//     return getUserObject(req).bind({}).then(function (object) {
//         log.v('post register, get user object = ', object);
//         var vs = util.copy(req.body);
//         vs.samplingInterval = Math.max(5, vs.samplingInterval || 0);
//         vs.uid = req.user._id.toString();
//         log.v('register, vs = ', vs);
//         return mongo.put(vs, CONSTANTS.VIRTUAL_SENSOR);
//         // var sids = util.toSet(object.registeredIds);
//         // sids.add(req.body.sid);
//         // object.registeredIds = sids.toArray();
//         // log.v('post register, object = ', object);
//         // return mongo.put(object, CONSTANTS.CONFIG);
//     }).then(function (result) {
//         log.v('post register, result = ', result);
//         return ERROR.ok(res, result);
//     }).then(function () {
//         return collector.handlePostSchedule(req.body);
//     }).catch(function (err) {
//         log.e('err = ', err);
//     });
//
// });
//
// router.delete('/registered/:sid', function (req, res) {
//     return getUserObject(req).then(function (object) {
//         object.registeredIds = util.set(object.registeredIds);
//         util.removeItem(object.registeredIds, req.params.sid);
//         return mongo.put(object, CONSTANTS.CONFIG);
//     }).then(function (result) {
//         return ERROR.ok(res, result);
//     }).then(function () {
//         return collector.handlePostSchedule(req.body);
//     }).catch(function (err) {
//         log.e('err = ', err);
//     });
// });
//
// function getRegistered(req, res) {
//     log.req(req);
//     return getUserObject(req).then(function (object) {
//         return mongo.get(object.registeredIds || [], CONSTANTS.SENSOR);
//     }).then(function (sensors) {
//         log.i('register(), sensors = ', sensors);
//         res.send(sensors.toArray());
//     });
// }
// router.get('/registered', auth.nextOrRedirect, getRegistered);
//
//
// router.post('/all', function (req, res) {
//     log.req(req);
//     var sensor = req.body;
//     return mongo.get({lat: sensor.lat, lng: sensor.lng}, CONSTANTS.SENSOR).bind({}).spread(function (result) {
//         if (result) {
//             log.i('post all, duplicated item, sensor = ', sensor);
//             throw ERROR.DUP_SENSOR;
//         }
//         return mongo.put(sensor, CONSTANTS.SENSOR);
//     }).then(function (result) {
//         this.sensor = result;
//         log.i('post all, insert sensor, result = ', result);
//         // update default pool
//         return getDefaultPool();
//     }).then(function (pool) {
//         log.i('post all, pool = ', pool);
//         pool.sids.push(this.sensor._id.toString());
//         return mongo.put(pool, CONSTANTS.POOL);
//     }).then(function () {
//             ERROR.ok(res, this.sensor);
//         }
//     ).catch(function (err) {
//         ERROR.badRequest(res, err);
//     });
// });
//
// router.delete('/all/:sid', function (req, res) {
//     log.req(req);
//     return getDefaultPool().then(function (pool) {
//         util.removeItem(pool.sids, req.params.sid);
//         return mongo.put(pool, CONSTANTS.POOL);
//     }).then(function (pool) {
//         return mongo.remove(req.params.sid, CONSTANTS.SENSOR);
//     }).then(function (result) {
//         return ERROR.ok(res, result);
//     });
// });
//
// function getAllSensors(req, res) {
//     log.req(req);
//     return getDefaultPool().then(function (pool) {
//         log.i('getAllSensors(), sids = ', pool.sids);
//         return mongo.get(pool.sids, CONSTANTS.SENSOR);
//     }).then(function (sensors) {
//         sensors = sensors.toArray();
//         log.i('getAllSensors(), length = ', sensors ? sensors.length : 0, ', sensors = ', sensors);
//         ERROR.ok(res, sensors);
//     });
// }
// router.get('/all', auth.nextOrRedirect, getAllSensors);

module.exports = router;

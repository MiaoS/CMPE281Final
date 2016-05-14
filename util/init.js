'use strict';
var Promise = require('bluebird');
var assert = require('chai').assert;
var log = require('../util/log');
var mongo = require('../util/mongodb');
var util = require('../util/util');
var CONST = require('../values/constants');

var rp = require('request-promise');
var customer;
var farmer;
var driver;
var admin;
var currentProduct;

var fs = require('fs');
var _ = require('underscore');

function init() {
    if (process.env.NODE_DO_INIT || true) {
        doInit();
    }
}

function doInit() {
    log.v('doInit()');

    begin().then(function () {
        rp = rp.defaults({jar: true});
        return mongo.getDB();
    }).then(function (db) {
        db.dropDatabaseAsync();
    }).then(function () {
        return signup({
            firstname: "Haoda",
            lastname: "Weng",
            email: "wenghaoda@gmail.com",
            username: "chitoo",
            password: "1"
        });
    }).then(function () {
        return signin({username: 'chitoo', password: '1'});
    }).then(function () {
        return getUser();
    }).then(function (user) {
        this.user = user;
    }).then(function () {
        return post('/sensor/', {name: 'sjsu', lat: '37.359989', lng: '-121.926968', stationId: 'id1'});
    }).then(function (sensor) {
        this.sensor = sensor;
        return getSensor(sensor._id.toString());
    }).then(function () {
        return getAllSensors();
    }).then(function () {
        return removeSensor(this.sensor._id.toString());

        // }).then(function () {
        //     return post('/sensor', {name: 'sjsu', lat: '37.359989', lng: '-121.926968', stationId: 'stationId1'});
        // }).then(function (sensor) {
        //     this.sensor = sensor;
        //     return post('/sensor', {name: 'sj airport', lat: '37.364026', lng: '-121.928815', stationId: 'stationId2'});
        // }).then(function (sensor) {
        //     return post('/sensor', {name: 'unknow', lat: '37.390061', lng: '-121.883720', stationId: 'stationId3'});

    }).then(function () {
        return post('/virtualSensor/', {sid: this.sensor._id.toString(), status: 'true'});
    }).then(function (vs) {
        this.vs = vs;
        return getVirtualSensor(vs._id.toString());
    }).then(function () {
        return getAllVirtualSensors();
    }).then(function () {
        return getUserVirtualSensors();
    }).then(function () {
        return getUserAvailableVirtualSensors();
    }).then(function () {
        return removeVirtualSensor(this.vs._id.toString());
    }).then(function () {
        // return post('/virtualSensor/', {sid: this.sensor._id.toString(), status: 'true'});
    }).then(function () {
        importSensors();
    }).catch(function (err) {
        if (err && err.stack) {
            log.e('err = ', err.stack);
        } else {
            log.e('err = ', err);
        }
    });

    var assertProperties = function (body, json) {
        body = util.objectify(body);
        for (var attr in json) {
            // log.v('body[' + attr + '] = ', body[attr], ', json[' + attr + '] = ', json[attr]);
            assert(body[attr] === json[attr]);
        }
    };
    var signup = function (json) {
        return rp({
            uri: 'http://localhost:3000/signup',
            method: 'POST',
            json: json
        }).then(function (body) {
        }).catch(function (err) {
            assert(err.statusCode == 302);
        });
    };
    var signin = function (json) {
        return rp({
            uri: 'http://localhost:3000/signin',
            method: 'post',
            json: json,
            followAllRedirects: true,
        }).then(function (body) {
            log.v(body);
            return body;
        }).catch(function (err) {
            // assert(err.statusCode == 302);
        });
    };
    var getUser = function () {
        return rp({
            uri: 'http://localhost:3000' + '/user/me',
            method: 'get',
        }).then(function (body) {
            log.v(body);
            body = util.objectify(body);
            assert(body._id);
            return body;
        }).catch(function (err) {
            // assert(err.statusCode == 302);
        });
    };
    var post = function (endpoint, json) {
        return rp({
            uri: 'http://localhost:3000' + endpoint,
            method: 'post',
            json: json
        }).then(function (body) {
            log.v(body);
            assertProperties(body, json);
            return util.objectify(body);
        }).catch(function (err) {
            log.e(err.stack);
            // assert(err.statusCode == 302);
        });
    };

    var startAllSchedule = function () {
        return rp({
            uri: 'http://localhost:3000' + '/collector/startAllSchedule',
            method: 'post',
        }).then(function (body) {
            log.v(body);
            return body;
        }).catch(function (err) {
            // assert(err.statusCode == 302);
        });
    };
    var getAllSensors = function () {
        return rp({
            uri: 'http://localhost:3000' + '/sensor/',
            method: 'get',
        }).then(function (body) {
            log.v(body);
            body = util.objectify(body);
            assert(body.length);
            return body;
        }).catch(function (err) {
        });
    };
    var getSensor = function (sid) {
        return rp({
            uri: 'http://localhost:3000' + '/sensor/' + sid,
            method: 'get',
        }).then(function (body) {
            log.v(body);
            body = util.objectify(body);
            assert(body._id);
            return body;
        }).catch(function (err) {
        });
    };
    var removeSensor = function (sid) {
        return rp({
            uri: 'http://localhost:3000' + '/sensor/' + sid,
            method: 'delete',
        }).then(function (body) {
            log.v(body);
            body = util.objectify(body);
            return body;
        }).catch(function (err) {
        });
    };

    var getAllVirtualSensors = function () {
        return rp({
            uri: 'http://localhost:3000' + '/virtualSensor/',
            method: 'get',
        }).then(function (body) {
            log.v(body);
            body = util.objectify(body);
            assert(body.length);
            return body;
        }).catch(function (err) {
        });
    };
    var getUserVirtualSensors = function () {
        return rp({
            uri: 'http://localhost:3000' + '/virtualSensor/my',
            method: 'get',
        }).then(function (body) {
            log.v(body);
            body = util.objectify(body);
            assert(body.length);
            return body;
        }).catch(function (err) {
        });
    };
    var getUserAvailableVirtualSensors = function () {
        return rp({
            uri: 'http://localhost:3000' + '/virtualSensor/available',
            method: 'get',
        }).then(function (body) {
            log.v(body);
            body = util.objectify(body);
            assert(body.length);
            return body;
        }).catch(function (err) {
        });
    };
    var getVirtualSensor = function (sid) {
        return rp({
            uri: 'http://localhost:3000' + '/virtualSensor/' + sid,
            method: 'get',
        }).then(function (body) {
            log.v(body);
            body = util.objectify(body);
            assert(body._id);
            return body;
        }).catch(function (err) {
        });
    };
    var removeVirtualSensor = function (sid) {
        return rp({
            uri: 'http://localhost:3000' + '/virtualSensor/' + sid,
            method: 'delete',
        }).then(function (body) {
            log.v(body);
            body = util.objectify(body);
            return body;
        }).catch(function (err) {
        });
    };

    function begin() {
        return Promise.bind({});
    }


    function importSensors() {
        var stationList = require('../values/station-list.json');
        log.v('stations.length = ', stationList.stations.length);
        return Promise.each(stationList.stations, function (stationId) {
            return rp({
                uri: 'http://localhost:' + CONST.PORT_COLLECTOR + '/collector/station/' + stationId,
                method: 'get',
            }).then(function (data) {
                log.v('importSensors, data = ', data);
                data = util.objectify(data);
                if (data) {
                    return post('/sensor', {stationId: data.stationId, lat: data.lat, lng: data.lng});
                } else {
                    stationList.stations = _.without(stationList.stations, stationId);
                    fs.writeFileSync('./values/station-list.json', JSON.stringify(stationList));
                }
            })
        }).catch(function (err) {
            log.e(err.stack);
        });
    }
}

module.exports = init;

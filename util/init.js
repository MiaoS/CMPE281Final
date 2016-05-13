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


function init() {
    if (process.env.NODE_DO_INIT || true) {
        doInit();
    }
}

function doInit() {
    log.v('doInit()');

    var assertProperties = function (body, json) {
        body = util.objectify(body);
        for (var attr in json) {
            log.v('body[' + attr + '] = ', body[attr], ', json[' + attr + '] = ', json[attr]);
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
            jar: true
        }).then(function (body) {
            log.v(body);
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

    function begin() {
        return Promise.bind({});
    }

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
        return startAllSchedule();
    }).then(function () {
        return post('/sensor/all', {name: 'sjsu', lat: '37.359989', lng: '-121.926968', stationId: 'id1'});
    }).then(function () {
        return post('/sensor/all', {name: 'unknown', lat: '37.302725', lng: '-121.909313', stationId: 'id2'});
    }).then(function (sensor) {
        return rp({
            uri: 'http://localhost:3000/sensor/registered',
            method: 'post',
            json: {sid: sensor._id.toString(), status: 'true'}
        }).then(function (body) {
            log.v(body);
            return body;
        })
    }).catch(function (err) {
        if (err && err.stack) {
            log.e('err = ', err.stack);
        } else {
            log.e('err = ', err);
        }
    });

}

module.exports = init;

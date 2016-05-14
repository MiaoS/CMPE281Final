/**
 * Created by chitoo on 3/8/16.
 */
'use strict';
var CONSTANTS = {
    url: 'mongodb://localhost/sensorCloud',
    PORT_COLLECTOR: process.env.PORT_COLLECTOR || 3000,
    PORT_SENSOR: process.env.PORT_SENSOR || 3000,
    PORT_VS: process.env.PORT_VS || 3000,
    PORT_DATA: process.env.PORT_DATA || 3000,

    DEFAULT_COLLECTION: 'default',
    USER: 'users',
    CONFIG: 'config',
    POOL: 'pool',
    SENSOR: 'sensor',
    VIRTUAL_SENSOR: 'virtual_sensor',
    SCHEDULE: 'schedule',
    DATA: 'data',


    MIN_SAMPLING_INTERVAL: 5,
};

module.exports = CONSTANTS;
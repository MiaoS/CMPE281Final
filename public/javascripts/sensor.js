var AVAILABLE_ICON = '/images/location-outline.png';
var REGISTERED_ICON = '/images/location.png';
var SENSOR_OPR_ADD = 'add';
var SENSOR_OPR_REMOVE = 'remove';
var SENSOR_OPR_REGISTER = 'register';
var SENSOR_OPR_UNREGISTER = 'unregister';
var BTN_SHOW_AVAILABLE = 'Show Available';
var BTN_HIDE_AVAILABLE = 'Hide Available';
var BTN_ADD_SENSOR = 'Add New';
var operationOption = BTN_SHOW_AVAILABLE;
function showSensorInfo(sensor) {
    switch (sensor.operation) {
        case SENSOR_OPR_ADD:
            $("#dialog_opr_btn").unbind().click(function () {
                var form = {
                    name: $('#sensor_name').val(),
                    lat: $('#sensor_lat').val(),
                    lng: $('#sensor_lng').val(),
                    stationId: $('#sensor_station_id').val()
                };
                log('new sensor, form = ', form);
                $.post("/sensor/", form, function (data) {
                    refreshCurrentView();
                })
                    .done(function () {
                    })
                    .fail(function () {
                        vex.dialog.alert('Add failed! Sensor exists.');
                    })
                    .always(function () {
                    });
            });
            showWindow();
            break;
        case SENSOR_OPR_REMOVE:
            $("#dialog_body").text('id: ' + sensor._id);
            $("#dialog_opr_btn").unbind().click(function (data) {
                $.ajax({
                    url: "/sensor/" + sensor._id,
                    type: 'DELETE',
                    success: function (data) {
                        refreshCurrentView();
                    }
                }).fail(function () {
                    vex.dialog.alert('Remove failed!');
                });
            });
            showWindow();
            break;
        case SENSOR_OPR_REGISTER:
        case SENSOR_OPR_UNREGISTER:
            log('sensor.samplingInterval = ', sensor.samplingInterval, ', alias = ', sensor.alias,
                ', group = ', sensor.group, ', status = ', sensor.status);
            $('#register_title').text('ID: ' + sensor._id);
            $('#register_interval').val(sensor.samplingInterval || 10);
            $('#register_alias').val(sensor.alias);
            $('#register_group').val(sensor.group).change();
            $('#register_status').prop('checked', sensor.status);

            if (sensor.operation == SENSOR_OPR_REGISTER) {
                $("#dialog_opr_btn").unbind().click(function (data) {
                    var sensorInfo = {
                        sid: sensor._id,
                        samplingInterval: $('#register_interval').val(),
                        alias: $('#register_alias').val(),
                        status: $('#register_status').prop('checked'),
                        group: $('#register_group').val()
                    };
                    $.post("/virtualSensor", sensorInfo, function () {
                        refreshCurrentView();
                    }).done(function () {
                    }).fail(function () {
                        vex.dialog.alert('Register failed!');
                    }).always(function () {
                    });
                });
                $("#dialog_opr_btn2").hide();
            } else {
                $("#dialog_opr_btn").unbind().click(function (data) {
                    $.ajax({
                        url: "/virtualSensor/" + sensor._id,
                        type: 'DELETE',
                        success: function (data) {
                            refreshCurrentView();
                        }
                    }).fail(function () {
                        vex.dialog.alert('Unregister failed!');
                    });
                });
                $("#dialog_opr_btn2").show();
                $("#dialog_opr_btn2").text('Details');
                $("#dialog_opr_btn2").unbind().click(function (data) {
                    window.location.href = "/report/vsid/" + sensor._id;
                });
            }

            showWindow();
            break;
    }


    $("#dialog_opr_btn").text(sensor.operation);
    $("#show_dialog").trigger("click");
}

function showInfoWindow() {
    $("#sensor_info").show();
    $("#register_sensor").hide();
    $("#new_sensor").hide();
}

function showWindow() {
    switch (operationOption) {
        case BTN_SHOW_AVAILABLE:
        case BTN_HIDE_AVAILABLE:
            $("#sensor_info").hide();
            $("#register_sensor").show();
            $("#new_sensor").hide();
            break;
        case BTN_ADD_SENSOR:
            $("#sensor_info").hide();
            $("#register_sensor").hide();
            $("#new_sensor").show();
            break;
    }
}

function renderAvailable(data) {
    log("renderAvailable(), data.length = ", data.length);
    if (map.avaiableSensors) {
        map.avaiableSensors.forEach(function (sensor) {
            sensor.marker.setMap(null);
        })
    }
    map.avaiableSensors = [];

    if (!data || !data.length) {
        return;
    }

    data.forEach(function (sensor) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(sensor.lat, sensor.lng),
            icon: AVAILABLE_ICON,
            title: sensor.title
        });
        marker.setMap(map);
        sensor.marker = marker;
        google.maps.event.addListener(marker, 'click', function () {
            log('getAvailableSensors(), marker clicked, marker id = ', sensor._id);
            sensor.operation = SENSOR_OPR_REGISTER;
            showSensorInfo(sensor);
        });
        map.avaiableSensors.push(sensor);
    });
}
function getAvailableSensors() {
    $.get("/virtualSensor/available", function (data) {
        renderAvailable(data);
    });
}

function renderRegisteredSensors(data) {
    log("renderRegisteredSensors(), data = ", data);

    // clear
    if (map.registered) {
        map.registered.forEach(function (sensor) {
            sensor.marker.setMap(null);
        })
    }
    map.registered = [];

    if (!data || !data.length) {
        return;
    }

    // render new
    data.forEach(function (sensor) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(sensor.s.lat, sensor.s.lng),
            icon: REGISTERED_ICON,
            title: '' + sensor._id
        });
        marker.setMap(map);
        sensor.marker = marker;
        google.maps.event.addListener(marker, 'click', function () {
            log('getRegisteredSensors(), marker clicked, marker id = ', sensor._id);
            sensor.operation = SENSOR_OPR_UNREGISTER;
            showSensorInfo(sensor);
        });
        map.registered.push(sensor);
    });
}

function getRegisteredSensors() {
    $.get("/virtualSensor/my", function (data) {
        renderRegisteredSensors(data);
    });
}

function renderAllSensor(data) {
    log("renderAllSensor(), data.length = ", data.length);

    // clear
    if (map.all) {
        map.all.forEach(function (sensor) {
            sensor.marker.setMap(null);
        })
    }
    map.all = [];

    if (!data) {
        return;
    }
    // render new
    data.forEach(function (sensor) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(sensor.lat, sensor.lng),
            icon: REGISTERED_ICON,
            title: '' + sensor.name
        });
        marker.setMap(map);
        sensor.marker = marker;
        google.maps.event.addListener(marker, 'click', function () {
            log('getAllSensors(), marker clicked, marker id = ', sensor._id);
            sensor.operation = SENSOR_OPR_REMOVE;
            showSensorInfo(sensor);
        });
        map.all.push(sensor);
    });
}

function getAllSensors() {
    $.get("/sensor/", function (data) {
        renderAllSensor(data);
    });
}

function addControlButton(type) {
    function CenterControl(controlDiv, map) {
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '2px solid #fff';
        controlUI.style.borderRadius = '3px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Show available sensors';
        controlDiv.appendChild(controlUI);

        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlUI.appendChild(controlText);
        controlText.innerHTML = type;
        controlUI.addEventListener('click', function () {
            switch (controlText.innerHTML) {
                case BTN_SHOW_AVAILABLE:
                case BTN_HIDE_AVAILABLE:
                    controlText.innerHTML = controlText.innerHTML === BTN_SHOW_AVAILABLE ?
                        BTN_HIDE_AVAILABLE : BTN_SHOW_AVAILABLE;
                    operationOption = controlText.innerHTML;
                    refreshCurrentView();
                    break;
                case BTN_ADD_SENSOR:
                    operationOption = controlText.innerHTML;
                    showSensorInfo({operation: SENSOR_OPR_ADD});
                    break;
            }
        });
    }

    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map);
    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
}

function refreshCurrentView() {
    log('operationOption = ', operationOption);
    switch (operationOption) {
        case BTN_SHOW_AVAILABLE:
            renderAvailable([]);
            getRegisteredSensors();
            break;
        case BTN_HIDE_AVAILABLE:
            getAvailableSensors();
            getRegisteredSensors();
            break;
        case BTN_ADD_SENSOR:
            getAllSensors();
            break;
    }
}
var controllerFunction;
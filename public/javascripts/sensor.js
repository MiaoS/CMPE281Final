var AVAILABLE_ICON = '/images/bell.png';
var REGISTERED_ICON = '/images/adjust-brightness.png';
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
        case SENSOR_OPR_REMOVE:
            $("#dialog_body").text('id: ' + sensor._id);
            $("#dialog_opr_btn").unbind().click(function (data) {
                $.ajax({
                    url: "/sensor/all/" + sensor._id,
                    type: 'DELETE',
                    success: function (data) {
                        refreshCurrentView();
                    }
                }).fail(function () {
                    vex.dialog.alert('Remove failed!');
                });
            });
            showInfoWindow();
            break;
        case SENSOR_OPR_REGISTER:
            $('#register_title').text('ID: ' + sensor._id);
            $("#dialog_opr_btn").unbind().click(function (data) {
                $.post("/sensor/registered", {
                        sid: sensor._id,
                        samplingInterval: $('#register_interval').val(),
                        alias: $('#register_alias').val(),
                        status: $('#register_status').val()
                    }, function () {
                        refreshCurrentView();
                    })
                    .done(function () {
                    })
                    .fail(function () {
                        vex.dialog.alert('Register failed!');
                    })
                    .always(function () {
                    });
            });
            showRegisterWindow();
            break;
        case SENSOR_OPR_UNREGISTER:
            $('#register_title').text('ID: ' + sensor._id);
            $("#dialog_opr_btn").unbind().click(function (data) {
                $.ajax({
                    url: "/sensor/registered/" + sensor._id,
                    type: 'DELETE',
                    success: function (data) {
                        refreshCurrentView();
                    }
                }).fail(function () {
                    vex.dialog.alert('Unregister failed!');
                });
            });
            showRegisterWindow();
            break;
        case SENSOR_OPR_ADD:
            $("#dialog_opr_btn").unbind().click(function () {
                var form = {
                    name: $('#sensor_name').val(),
                    lat: $('#sensor_lat').val(),
                    lng: $('#sensor_lng').val(),
                    stationId: $('#sensor_station_id').val()
                };
                log('new sensor, form = ', form);
                $.post("/sensor/all/", form, function (data) {
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
            showNewSensor();
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

function showRegisterWindow() {
    $("#sensor_info").hide();
    $("#register_sensor").show();
    $("#new_sensor").hide();
}
function showNewSensor() {
    $("#sensor_info").hide();
    $("#register_sensor").hide();
    $("#new_sensor").show();
}
function renderAvailable(data) {
    log("renderAvailable(), data = ", data);
    if (map.avaiableSensors) {
        map.avaiableSensors.forEach(function (sensor) {
            log('renderAvailable(), sensor._id = ', sensor._id);
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
    $.get("/sensor/available", function (data) {
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
            position: new google.maps.LatLng(sensor.lat, sensor.lng),
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
    $.get("/sensor/registered", function (data) {
        renderRegisteredSensors(data);
    });
}

function renderAllSensor(data) {
    log("renderAllSensor(), data = ", data);

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
    $.get("/sensor/all", function (data) {
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
        switch (type) {
            case BTN_ADD_SENSOR:
                showAddButton(controlUI, controlText);
                break;
            case BTN_SHOW_AVAILABLE:
                showAvailableButton(controlUI, controlText);
                break;
        }
    }

    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map);
    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
}

function showAvailableButton(controlUI, controlText) {
    controlText.innerHTML = BTN_SHOW_AVAILABLE;
    controlUI.addEventListener('click', function () {
        if (controlText.innerHTML === BTN_SHOW_AVAILABLE) {
            controlText.innerHTML = BTN_HIDE_AVAILABLE;
        } else {
            controlText.innerHTML = BTN_SHOW_AVAILABLE;

        }
        operationOption = controlText.innerHTML;
        refreshCurrentView();
    });
}

function refreshCurrentView() {
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

function showAddButton(controlUI, controlText) {
    controlText.innerHTML = BTN_ADD_SENSOR;
    controlUI.addEventListener('click', function () {
        showSensorInfo({operation: SENSOR_OPR_ADD});
    });
}
var controllerFunction;
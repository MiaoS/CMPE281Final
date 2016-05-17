var AVAILABLE_ICON = '/images/location-outline.png';
var REGISTERED_ICON = '/images/location.png';
var SENSOR_OPR_ADD = 'Add';
var SENSOR_OPR_REMOVE = 'Remove';
var SENSOR_OPR_REGISTER = 'Register';
var SENSOR_OPR_UNREGISTER = 'Unregister';
var BTN_SHOW_AVAILABLE = 'Show Available';
var BTN_HIDE_AVAILABLE = 'Hide Available';
var BTN_ADD_SENSOR = 'Add New';
var operationOption;

function doUpdateSensor(sensor) {
    var form = {
        name: $('#sensor_name').val(),
        lat: $('#sensor_lat').val(),
        lng: $('#sensor_lng').val(),
        stationId: $('#sensor_station_id').val()
    };
    if (sensor) {
        form._id = sensor._id;
    }
    $.post("/sensor", form, function (data) {
        refreshCurrentView();
    }).done(function () {
    }).fail(function () {
        vex.dialog.alert('Add failed! Sensor exists.');
    }).always(function () {
    });
}

function addPhysicalSensor(sensor) {
    $("#sensor_id_field").text('Add Sensor');
    $("#sensor_opr_left").unbind().click(doUpdateSensor);
    $("#sensor_opr_right").hide();
}

function removePhysicalSensor(sensor) {
    $("#sensor_id_field").text('id: ' + sensor._id);
    $("#sensor_opr_left").unbind().click(function (data) {
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
    $('#sensor_name').text('ID: ' + sensor._id);
    $('#sensor_name').val(sensor.name);
    $('#sensor_lat').val(sensor.lat);
    $('#sensor_lng').val(sensor.lng);
    $('#sensor_station_id').val(sensor.stationId);

    $("#sensor_opr_right").show();
    $("#sensor_opr_right").text('Update');
    $("#sensor_opr_right").unbind().click(function () {
        doUpdateSensor(sensor);
    });
}

function updateVirtualSensor(sensor) {
    var vs = {
        sid: sensor.sid || sensor._id,
        samplingInterval: $('#vs_interval').val(),
        name: $('#vs_name').val(),
        status: $('#vs_status').prop('checked'),
        group: $('#vs_group').val()
    };
    $.post("/virtualSensor", vs, function () {
        refreshCurrentView();
    }).done(function () {
    }).fail(function () {
        vex.dialog.alert('Register failed!');
    }).always(function () {
    });
}

function registerVirtualSensor(sensor) {
    $("#vs_id_field").text('Register Sensor');
    $("#vs_opr_left").unbind().click(function () {
        updateVirtualSensor(sensor);
    });
    $("#vs_opr_middle").hide();
    $("#vs_opr_right").hide();
}

function unregisterVirtualSensor(sensor) {
    $("#vs_id_field").text('ID: ' + sensor._id);
    $("#vs_opr_left").unbind().click(function (data) {
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

    $("#vs_opr_middle").show();
    $("#vs_opr_middle").text('Update');
    $("#vs_opr_middle").unbind().click(function (data) {
        updateVirtualSensor(sensor);
    });

    $("#vs_opr_right").show();
    $("#vs_opr_right").text('Details');
    $("#vs_opr_right").unbind().click(function (data) {
        window.location.href = "/report/vsid/" + sensor._id;
    });
}

function showSensorForm(sensor) {
    log('sensor.operation = ', sensor.operation);
    switch (sensor.operation) {
        case SENSOR_OPR_ADD:
        case SENSOR_OPR_REMOVE:
            if (sensor.operation == SENSOR_OPR_ADD) {
                addPhysicalSensor(sensor);
            } else {
                removePhysicalSensor(sensor);
            }


            $("#sensor_opr_left").text(sensor.operation);
            $('#physical_sensor_form').modal("show");
            break;

        case SENSOR_OPR_REGISTER:
        case SENSOR_OPR_UNREGISTER:

            log('sensor.samplingInterval = ', sensor.samplingInterval, ', name = ', sensor.name,
                ', group = ', sensor.group, ', status = ', sensor.status);

            $('#vs_interval').val(sensor.samplingInterval || 60);
            $('#vs_name').val(sensor.name);
            $('#vs_group').val(sensor.group).change();
            $('#vs_status').prop('checked', sensor.status == 'true');

            if (sensor.operation == SENSOR_OPR_REGISTER) {
                registerVirtualSensor(sensor);
            } else {
                unregisterVirtualSensor(sensor);
            }

            $("#vs_opr_left").text(sensor.operation);
            $('#virtual_sensor_form').modal("show");
            break;
    }
}

function onChangeGroup() {
    if ($('#vs_group').val().length) {
        $("#vs_interval").prop('disabled', true);
        $("#vs_status").prop('disabled', true);
    } else {
        $("#vs_interval").prop('disabled', false);
        $("#vs_status").prop('disabled', false);
    }
}

function updateVirtualSensorGroup(group) {
    var vs = {
        samplingInterval: $('#vsg_interval').val(),
        name: $('#vsg_name').val(),
        status: $('#vsg_status').prop('checked'),
    };
    if (group) {
        vs._id = group._id;
    }
    $.post("/virtualSensorGroup", vs, function () {
        window.location.reload();
    }).done(function () {
    }).fail(function () {
        vex.dialog.alert('Operation failed!');
    }).always(function () {
    });
}

function showGroupForm(group) {
    log('group = ', group);

    if (group) {
        $('#vsg_name').val(group.name);
        $('#vsg_interval').val(group.samplingInterval || 60);
        $('#vsg_status').prop('checked', group.status == 'true');

        $("#vsg_opr_left").text('Remove');
        $("#vsg_opr_left").unbind().click(function () {
            $.ajax({
                url: "/virtualSensorGroup/" + group._id,
                type: 'DELETE',
                success: function (data) {
                    window.location.reload();
                }
            }).fail(function () {
                vex.dialog.alert('Remove failed!');
            });
        });

        $("#vsg_opr_right").show();
        $("#vsg_opr_right").text('Update');
        $("#vsg_opr_right").unbind().click(function () {
            updateVirtualSensorGroup(group);
        });
    } else {
        $("#vsg_id_field").text('Greate Group');
        $("#vsg_opr_left").text('Create');
        $("#vsg_opr_left").unbind().click(function () {
            updateVirtualSensorGroup();
        });
        $("#vsg_opr_right").hide();
    }
    $('#virtual_sensor_group_form').modal("show");
}

function renderAvailable(data) {
    log("renderAvailable(), data.length = ", data.length);
    if (map.avaiableSensors) {
        for (var sid in map.avaiableSensors) {
            var sensor = map.avaiableSensors[sid];
            sensor.marker.setMap(null);
        }
    }
    map.avaiableSensors = {};

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
            log('getAvailableSensors(), marker clicked, sensor._id = ', sensor._id);
            sensor.operation = SENSOR_OPR_REGISTER;
            showSensorForm(sensor);
        });
        map.avaiableSensors[sensor._id.toString()] = sensor;
    });
}

function showSensor(sid) {
    var pool = map.registered || map.all;
    var sensor = pool[sid];
    log('sensor = ', sensor);
    google.maps.event.trigger(sensor.marker, 'click');
}
function showGroup(group) {
    showGroupForm(group);
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
        for (var sid in map.registered) {
            var sensor = map.registered[sid];
            sensor.marker.setMap(null);
        }
    }
    map.registered = {};

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
            showSensorForm(sensor);
        });
        map.registered[sensor._id.toString()] = sensor;
    });
}

function getRegisteredSensors() {
    $.get("/virtualSensor/my", function (data) {
        var $scope = angular.element("#iambody").scope();
        $scope.$apply(function () {
            $scope.sensors = data;
        });
        renderRegisteredSensors(data);
    });
}

function getMyGroups() {
    $.get("/virtualSensorGroup/my", function (data) {
        log('groups = ', data);
        var $scope = angular.element("#iambody").scope();
        $scope.$apply(function () {
            $scope.groups = data;
        });
    });

}

function renderAllSensor(data) {
    log("renderAllSensor(), data.length = ", data.length);

    // clear
    if (map.all) {
        for (var sid in map.all) {
            var sensor = map.all[sid];
            sensor.marker.setMap(null);
        }
    }
    map.all = {};

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
            showSensorForm(sensor);
        });
        map.all[sensor._id.toString()] = sensor;
    });
}

function getAllSensors() {
    $.get("/sensor", function (data) {
        var $scope = angular.element("#iambody").scope();
        $scope.$apply(function () {
            $scope.sensors = data;
        });
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
        operationOption = controlText.innerHTML;
        log('controlText.innerHTML = ', controlText.innerHTML);
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
                    log('operationOption = ', operationOption);
                    showSensorForm({operation: SENSOR_OPR_ADD});
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

var currentHeight, currentDirection, sensorId, latitude, longitude;

var myLineChart;

var randomScalingFactor = function () {
    return Math.round(Math.random() * 12) + 2
};
var lineChartData = {
    labels: [],
    datasets: [
        {
            label: "Sensor 2",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: []
        }
    ]
}


window.onload = function () {

    getData();

    setUpLabel();
    setUpData();

    showCompass(currentDirection);
    showChart();

}

function getData() {

    // ** Change data here **
    sensorId = "4d974h28lskjfw89";

    // ** Change data here **
    latitude = 37.76;
    longitude = -122.53;

    // ** Change data here **
    currentHeight = Math.round(Math.random() * 50);
    // ** Change data here **
    currentDirection = Math.round(Math.random() * 180);

}

function setUpLabel() {

    // lineChartData.labels = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

    var d = new Date();
    var h = d.getHours();

    var n = h - 11;

    if (n <= 0) {
        n = n + 24;
    }

    for (i=0; i<12; i++) {

        if (n >= 24) {
            n = 0;
        }

        lineChartData.labels.push(n + ":00");
        n++;

    }

}


function setUpData() {

    document.getElementById("sensorId").innerHTML = sensorId;

    document.getElementById("latitude").innerHTML = latitude + ", ";
    document.getElementById("longitude").innerHTML = longitude;

    document.getElementById("cur_height").innerHTML = currentHeight + " m, ";
    document.getElementById("cur_direction").innerHTML = currentDirection + "\xB0 from North";

    // Change data here
    lineChartData.datasets[0].data = [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor()];

}



function showChart() {
    if (myLineChart){
        myLineChart.destroy();
    }

    var ctx = document.getElementById("chart").getContext("2d");
    myLineChart = new Chart(ctx).Line(lineChartData, {
        responsive: true
    });

    window.myLine = myLineChart;
}


function showCompass(direction) {

    var canvas = document.getElementById("compass");
    var ctx = canvas.getContext("2d");

    drawArrowAtAngle(direction, ctx);

    function drawArrowAtAngle(angle, ctx) {

        var w = canvas.width;
        var h = canvas.height;
        var r = w / 2

        ctx.save();
        ctx.translate(r, r);
        ctx.rotate(angle * Math.PI / 180);
        ctx.translate(-r, -r);
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo(r, r);
        ctx.lineTo(r, 0);
        ctx.lineTo(r * 0.95, r / 5);
        ctx.arcTo(r, 0, r * 1.05, r / 5, r / 10);
        ctx.lineTo(r, 0);
        ctx.strokeStyle = '#C62828';
        ctx.stroke();
        ctx.fillStyle = '#C62828';
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}





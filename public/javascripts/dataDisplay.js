var currentHeight, currentDirection;

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

    currentHeight = Math.round(Math.random() * 50)
    document.getElementById("cur_height").innerHTML = currentHeight + " m, ";

    currentDirection = Math.round(Math.random() * 180)
    document.getElementById("cur_direction").innerHTML = currentDirection + "\xB0";

    showCompass(currentDirection);
    showChart();
    selectTime();

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
        ctx.lineWidth = 1;
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

function getVsid() {
    const res = '/report/vsid/';
    var index = window.location.href.indexOf(res);
    if (index < 0) {
        return;
    }
    var vsid = window.location.href.substr(index + res.length);
    log('vsid = ', vsid);
    return vsid;
}

function updateDataWith(url) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            var data = objectify(request.responseText);
            lineChartData.labels = _.pluck(data, 'date_time');
            lineChartData.datasets[0].data = _.pluck(data, 'sea_surface_wave_significant_height (m)');
            // log('data = ', data);
            log('labels = ', lineChartData.labels, ', data = ', lineChartData.datasets[0].data);
            showChart();
        }
    };

    request.open("GET", url, true);
    request.send();
}

function selectTime() {

    if (document.getElementById('monthly').checked) {
        updateDataWith("/data/vsid/" + getVsid());
    } else if (document.getElementById('daily').checked) {
        updateDataWith("/data/vsid/" + getVsid());
    } else if (document.getElementById('hourly').checked) {
        updateDataWith("/data/vsid/" + getVsid());
    }

}




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


function selectTime() {

    if (document.getElementById('monthly').checked) {

        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                var data = JSON.parse(request.responseText);
            }
        };
        request.open("GET", "/data/hourly.json", true);
        request.send();

        myLineChart.destroy();
        lineChartData.labels = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
        lineChartData.datasets[0].data = [
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor()];
        showChart();

    } else if (document.getElementById('daily').checked) {

        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                var data = JSON.parse(request.responseText);
            }
        };
        request.open("GET", "/data/daily.json", true);
        request.send();

        myLineChart.destroy();
        lineChartData.labels = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th", "20th", "21st", "22nd", "23rd", "24th", "25th", "26th", "27th", "28th", "29th", "30th", "31st"];
        lineChartData.datasets[0].data = [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor()];
        showChart();
    } else if (document.getElementById('hourly').checked) {
        myLineChart.destroy();
        lineChartData.labels = ["0:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
        lineChartData.datasets[0].data = [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor()];
        showChart();
    }

}




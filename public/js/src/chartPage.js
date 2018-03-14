(function () {
  const chartData = {
    // A labels array that can contain any sort of values
    labels: [
      '1:00AM', '', '',
      '3:00AM', '', '',
      '5:00AM', '', '',
      '7:00AM', '', '',
      '9:00AM', '', '',
      '11:00AM', '', '',
    ],
    // Our series array that contains series objects or in this case series data arrays
    series: [
      [ 5, 15, 13, 17, 7, 10, 5, 15, 13, 17, 7, 10, 5, 15, 13, 17, 7, 10 ],
      [ 15, 5, 3, 17, 17, 3, 15, 5, 3, 9, 17, 3, 15, 5, 13, 9, 17, 3 ],
    ]
  };

  const chartOptions = {
    width: 365,
    height: 100,
    // X-Axis specific configuration
    axisX: {
      offset: 30,
      position: 'end',
      labelOffset: {
        x: 0,
        y: 0
      },
      showGrid: true,
      showLabel: true,
    },
    axisY: {
      type: window.Chartist.AutoScaleAxis,
      scaleMinSpace: 10,
      offset: 40,
      position: 'start',
      labelOffset: {
        x: 5,
        y: 4
      },
      showGrid: true,
      showLabel: true,
      labelInterpolationFnc: function (value) {
        return value + ' MB';
      }
    },
    showLine: true,
    showPoint: true,
    lineSmooth: false,
    low: 0,
    high: 20,
    chartPadding: {
      top: 15,
      right: 15,
      bottom: 5,
      left: 10
    },
    fullWidth: false,
  };

  // Create a new line chart object where as first parameter we pass in a selector
  // that is resolving to our chart container element. The Second parameter
  // is the actual data object.
  new window.Chartist.Line('.m-chart-1', chartData, chartOptions);
  new window.Chartist.Line('.m-chart-2', chartData, chartOptions);
})();

function descriptorsDefault(graph, helpers, outputFrame) {
  // reset outputData, here `outputFrame.data` is an array to comply
  // with the data format accepted by the xmm encoder / decoder
  outputFrame.data = [];

  // define the keys from `inputFrame.data` to be copied into `outputFrame.data`
  var filteredKeys = [
    'intensity',
    'accelerationBandpass5hz',
    'orientation',
    'rotationRateMs'
  ];

  // we can do additionnal things here such as creating filters, etc., e.g.
  // var movingAverage = new helpers.algo.MovingAverage(12);

  // return the function that will executed on each frame
  return function(inputFrame, outputFrame) {
    var inputData = inputFrame.data;

    // Copy the data that must be sent to the ML module into `outputFrame.data`
    // by default, we only forward the values computed by the `motionDescriptors`.
    // As the ML modules requires a flat array as input, we copy values
    // from chosen entries into the `outputFrame.data` array
    var index = 0;

    for (var i = 0; i < filteredKeys.length; i++) {
      var key = filteredKeys[i];

      for (var j = 0; j < inputData[key].length; j++) {
        outputFrame.data[index] = inputData[key][j];
        index += 1;
      }
    }

    return outputFrame;
  }
}
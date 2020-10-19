function defaultMLDescriptors(graph, helpers, outputFrame) {
  // reset outputData, here `outputFrame.data` is an array to comply
  // with the data format accepted by the xmm encoder / decoder
  outputFrame.data = [];

  // define the keys from `inputFrame.data` to be copied into `outputFrame.data`
  const filteredKeys = [
    'intensity',
    'accelerationBandpass5hz',
    'orientation',
    'rotationRateMs'
  ];

  // we can do additionnal things here such as creating filters, etc., e.g.
  // var movingAverage = new helpers.algo.MovingAverage(12);

  // return the function that will executed on each frame
  return {
    updateParams(updates) {
      // console.log(updates);
    },
    process(inputFrame, outputFrame) {
      const inputData = inputFrame.data;
      const outputData = outputFrame.data;

      // Copy the data that must be sent to the ML module into `outputFrame.data`
      // by default, we only forward the values computed by the `motionDescriptors`.
      // As the ML modules requires a flat array as input, we copy values
      // from chosen entries into the `outputFrame.data` array
      let index = 0;

      for (let i = 0; i < filteredKeys.length; i++) {
        const desc = filteredKeys[i];

        if (Array.isArray(inputData[desc])) {
          for (let j = 0; j < inputData[desc].length; j++) {
            outputData[index] = inputData[desc][j];
            index += 1;
          }
        // handle objects
        } else if (Object.prototype.toString.call(inputData[desc]) === '[object Object]') {
          for (let key in inputData[desc]) {
            outputData[index] = inputData[desc][key];
            index += 1;
          }
        // consider everything else as a scalar
        } else {
          outputData[index] = inputData[desc];
          index += 1;
        }
      }

      return outputFrame;
    },
    destroy() {

    },
  };
}
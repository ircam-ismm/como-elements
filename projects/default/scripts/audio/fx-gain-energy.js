function fxGainEnergy(graph, helpers, audioInNode, audioOutNode, outputFrame) {

  // user const
  const adjustLevelDB = 0; // [db]:  < 0 softer, > 0 louder
  const thresholdIntensity = 3e-3;  //old value 5e-3 without /3 in sqrt 
  const scalingShape = 0.1; //coeff in power function
  const scalingFactor = 2;


  // initialization
  const adjustLevelLin = helpers.math.decibelToLinear(adjustLevelDB); 
  const audioContext = graph.como.audioContext;
  const movingAverage = new helpers.algo.MovingAverage(12);
  const envelop = audioContext.createGain();

  audioInNode.connect(envelop);
  envelop.connect(audioOutNode);
  envelop.gain.value = 0;
  envelop.gain.setValueAtTime(0, audioContext.currentTime);

  return {
    updateParams(updates) {

    },
    process(inputFrame) {
      const now = audioContext.currentTime;
      //var enhancedIntensity = inputFrame.data['intensity'].compressed;
      const enhancedIntensity = inputFrame.data['intensity'].compressed;
      const gated = Math.max(thresholdIntensity, enhancedIntensity) - thresholdIntensity;
      const scaled = Math.min(Math.pow(gated, scalingShape) * scalingFactor, 1) * adjustLevelLin;
      const avg = movingAverage.process(scaled); 

      // we know that we have a frame every 20ms so a ramp of 10ms should be safe
      envelop.gain.setTargetAtTime(avg, now, 0.05);
    },
    destroy() {
      envelop.gain.setValueAtTime(0, audioContext.currentTime);

      audioInNode.disconnect(envelop);
      envelop.disconnect();

    },
  }
}
function fxVolumeEnergy(graph, helpers, audioInNode, audioOutNode, outputFrame) {

  // user parameters
  const adjustLevelDB = 0; // [db]:  < 0 softer, > 0 louder
  const thresholdIntensity = 1e-3;  //old value 5e-3 without /3 in sqrt 
  const scalingShape = 0.1; //coeff in power function
  const scalingFactor = 4; // correction after power function
  const movingAverageSize = 12; // filtering the energy enveloppe 


  // if you think you want to touch that, create a new script
  // in your prefered editor or at https://10.10.0.1/script-editor
  const adjustLevelLin = helpers.math.decibelToLinear(adjustLevelDB); 
  const audioContext = graph.como.audioContext;
  const movingAverage = new helpers.algo.MovingAverage(movingAverageSize);
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
      const compressedIntensity = inputFrame.data['intensity'].compressed;
      const gated = Math.max(thresholdIntensity, compressedIntensity) - thresholdIntensity;
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
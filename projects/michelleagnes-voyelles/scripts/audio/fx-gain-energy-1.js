function fxGainEnergy(graph, helpers, audioInNode, audioOutNode, outputFrame) {

  // user const
  const adjustLevelDB = 12; // [db]:  < 0 softer, > 0 louder
  const thresholdIntensity = 3e-3;  //old value 5e-3 without /3 in sqrt 
  const scalingShape = 0.5; //coeff in power function


  // initialization
  const adjustLevelLin = helper.math.decibelToLinear(adjustLevelDB); 
  
  const audioContext = graph.como.audioContext;
  const movingAverage = new helpers.algo.MovingAverage(4);
  const envelop = audioContext.createGain();

  audioInNode.connect(envelop);
  envelop.connect(audioOutNode);
  envelop.gain.value = 0;
  envelop.gain.setValueAtTime(0, audioContext.currentTime);

  

  return {
    process(inputFrame, outputFrame) {
      
      const now = audioContext.currentTime;
      const enhancedIntensity = inputFrame.data['intensity'][1];

      // better to use let and modify instead of several const ?
      const clipped = Math.max(thresholdIntensity, enhancedIntensity) - thresholdIntensity;
      const scaled = Math.pow(clipped, scalingShape) * adjustLevelLin;
      const avg = movingAverage.process(scaled); 
      
      // ? we know that we have a frame every 20ms so a ramp of 10ms should be safe
      envelop.gain.setValueAtTime(avg, now, 0.001); 
    },
    destroy() {
      envelop.gain.setValueAtTime(0, audioContext.currentTime);

      audioInNode.disconnect(envelop);
      envelop.disconnect();

    },
  }
}
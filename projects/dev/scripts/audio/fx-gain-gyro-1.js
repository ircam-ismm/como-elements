function fxGainGyro(graph, helpers, audioInNode, audioOutNode, outputFrame) {
 
  // user const
  const adjustLevelDB = 0; // [db]:  < 0 softer, > 0 louder
  const thresholdIntensity = 5e-6;  // old value 1e-5 without /3 in sqrt
  const scalingShape = 1; //coeff in power function
  const scalingFactor = 2;

  // initialization
  const adjustLevelLin = helpers.math.decibelToLinear(adjustLevelDB); 
  const audioContext = graph.como.audioContext;
  const movingAverage = new helpers.algo.MovingAverage(4);
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
      const alpha = inputFrame.data['rotationRate'].alpha;
      const beta = inputFrame.data['rotationRate'].beta;
      const gamma = inputFrame.data['rotationRate'].gamma;

      // better to use let and modify instead of several const ?
      const intensityGyro = Math.sqrt((alpha*alpha + beta*beta + gamma*gamma)/3) / 360; 
      const gated = Math.max(thresholdIntensity, intensityGyro) - thresholdIntensity;
      const scaled = Math.min(Math.pow(gated, scalingShape) * scalingFactor, 1) * adjustLevelLin;
      const avg = movingAverage.process(scaled); 

      //
      envelop.gain.setTargetAtTime(avg, now, 0.01); 

    },
    destroy() {
      envelop.gain.setValueAtTime(0, audioContext.currentTime);

      audioInNode.disconnect(envelop);
      envelop.disconnect();

    },
  }
}
function fxGainGyro(graph, helpers, audioInNode, audioOutNode, outputFrame) {

  // user const
  const adjustLevelDB = 0; // [db]:  < 0 softer, > 0 louder
  const adjustCutoff = 1; // adjusting bandpass frequency
  const adjustQ = 1; // adjusting bandpass Q
  const adjustLevelBackground = 1; // adjusting minimum energy
  const adjustLevelDynamic = 1; // adjusting minimum energy

  //const thresholdIntensity = 3e-6;  // old value 1e-5  without /3 in sqrt and *1000
  const scalingShape = 0.25; //coeff in power function
  const minCutoff =  300; // Hz do not set below 1
  const maxCutoff =  2000; //Hz
  const cutoffRatio = Math.log(maxCutoff / Math.max(1, minCutoff));
  const coeffOldVersion = Math.sqrt(3) / 360; // ?

  // initialization
  const adjustLevelLin = helpers.math.decibelToLinear(adjustLevelDB); 
  const audioContext = graph.como.audioContext;
  const movingAverage = new helpers.algo.MovingAverage(10);
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  audioInNode.connect(filter);
  filter.connect(gain);
  gain.connect(audioOutNode);

  gain.gain.value = 1;
  gain.gain.setValueAtTime(1, audioContext.currentTime);
  filter.type = 'bandpass';
  filter.Q.value = 1;
  filter.Q.setValueAtTime(1, audioContext.currentTime);
  filter.frequency.value = 2000;
  filter.frequency.setValueAtTime(2000, audioContext.currentTime);

  return {
    process(inputFrame, outputFrame) {
      const now = audioContext.currentTime;

      const alpha = inputFrame.data['rotationRate'][0];
      const beta = inputFrame.data['rotationRate'][1];
      const gamma = inputFrame.data['rotationRate'][2];
      const intensityGyro = Math.sqrt((alpha*alpha + beta*beta + gamma*gamma)/3); 
      const avg = movingAverage.process(intensityGyro); 
      const scaled = Math.pow(avg, scalingShape);
      //console.log(scaled);
      
      const cutoff = minCutoff * Math.exp(cutoffRatio * scaled * Math.pow(coeffOldVersion, scalingShape));
      filter.frequency.setTargetAtTime(cutoff * adjustCutoff, audioContext.currentTime, 0.01);
      filter.Q.setTargetAtTime(6 * scaled * Math.pow(coeffOldVersion, scalingShape) * adjustQ, audioContext.currentTime, 0.01);
      gain.gain.setTargetAtTime(adjustLevelLin * ((1 * adjustLevelBackground) + 4 * intensityGyro * coeffOldVersion * adjustLevelDynamic), audioContext.currentTime, 0.01);
    
    },
    destroy() {
      audioInNode.disconnect(filter);
      filter.disconnect();
      gain.disconnect();
      // ? to check
    },
  }
}
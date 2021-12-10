function fxGainGyro(graph, helpers, audioInNode, audioOutNode, outputFrame) {

    // user const
  const adjustLevelDB = 0; // [db]:  < 0 softer, > 0 louder
  const adjustCutoff = 100; // adjusting bandpass frequency
  const adjustQ = 5; // adjusting bandpass Q

  const thresholdIntensity = 1e-5;  // old value 1e-5  
  const scalingShape = 0.5; //coeff in power function
  const coeffOldVersion = Math.sqrt(3) / 360; // 

  // from Element to CoMo-Element
  // gyro (deg / ms) -> rotationRate (deg / s) -> 

  // initialization
  const adjustLevelLin = helpers.math.decibelToLinear(adjustLevelDB); 
  const audioContext = graph.como.audioContext;
  const movingAverage = new helpers.algo.MovingAverage(12);
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();


  audioInNode.connect(filter);
  filter.connect(gain);
  gain.connect(audioOutNode);

  gain.gain.value = adjustLevelLin;
  filter.type = 'bandpass';
  filter.Q.value = 1;
  filter.Q.setValueAtTime(1, audioContext.currentTime);
  filter.frequency.value = 2000;
  filter.frequency.setValueAtTime(2000, audioContext.currentTime);

  return {
    updateParams(updates) {

    },
    process(inputFrame) {
      const now = audioContext.currentTime;

      const alpha = inputFrame.data['rotationRate'].alpha;
      const beta = inputFrame.data['rotationRate'].beta;
      const gamma = inputFrame.data['rotationRate'].gamma;
      const intensityGyro = Math.sqrt((alpha*alpha + beta*beta + gamma*gamma)/3); 

      //maybe remove
      const gated = Math.max((thresholdIntensity / coeffOldVersion), intensityGyro) - (thresholdIntensity / coeffOldVersion);
      const scaled = Math.pow(gated, scalingShape); 
      
      //not used
      const avg = movingAverage.process(scaled); 
      // console.log(scaled);
      
      // set to 10
      filter.Q.setTargetAtTime(15* adjustQ * Math.max(0.0001, 1 - (avg * 20 * coeffOldVersion)), now, 0.05); // * 2 // * 6

    },
    destroy() {
      audioInNode.disconnect(filter);
      filter.disconnect();
      gain.disconnect();
      // ? to check
    },
  }
}
function fxGainGyro(graph, helpers, audioInNode, audioOutNode, outputFrame) {

  // user const
  const adjustLevelDB = 0; // [db]:  < 0 softer, > 0 louder
  const adjustCutoff = 1; // adjusting bandpass frequency
  const adjustQ = 1; // adjusting bandpass Q
  const adjustLevelBackground = 0.01; // adjusting minimum energy
  const adjustLevelDynamic = 2; // adjusting minimum energy
  const scalingIntensity = 0.5;

  const scalingShape = 0.25; //coeff in power function
  const minCutoff =  200; // Hz do not set below 1
  const maxCutoff =  1000; //Hz
  const cutoffRatio = Math.log(maxCutoff / Math.max(1, minCutoff));
  const MovingAverageSize = 10; //filering intensity
  const coeffOldVersion = Math.sqrt(3) / 360; // ?

  // initialization
  const adjustLevelLin = helpers.math.decibelToLinear(adjustLevelDB); 
  const audioContext = graph.como.audioContext;
  const movingAverage = new helpers.algo.MovingAverage(MovingAverageSize);
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
    updateParams(updates) {

    },
    process(inputFrame) {
      const now = audioContext.currentTime;

      const alpha = inputFrame.data['rotationRate'].alpha;
      const beta = inputFrame.data['rotationRate'].beta;
      const gamma = inputFrame.data['rotationRate'].gamma;
      const intensityGyro = Math.sqrt((alpha*alpha + beta*beta + gamma*gamma)/3); 
      const avg = movingAverage.process(intensityGyro); 
      const scaled = Math.pow(avg, scalingShape) * scalingIntensity;
      //console.log(scaled);
      
      const cutoff = minCutoff * Math.exp(cutoffRatio * scaled );
      filter.frequency.setTargetAtTime(cutoff * adjustCutoff, audioContext.currentTime, 0.01);
      filter.Q.setTargetAtTime( scaled * adjustQ, audioContext.currentTime, 0.01);
      gain.gain.setTargetAtTime((adjustLevelLin * (adjustLevelBackground + scaled * adjustLevelDynamic)), audioContext.currentTime, 0.01);
    
    },
    destroy() {
      audioInNode.disconnect(filter);
      filter.disconnect();
      gain.disconnect();
      // ? to check
    },
  }
}
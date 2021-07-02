function kickRotation(graph, helpers, audioInNode, audioOutNode, outputFrame) {

  // user const 
  const adjustLevelDB = 0; // [db]:  < 0 softer, > 0 louder
  const threshold = 0.01;
  const minTimeInterval = 0.5;
  const fadeInDuration = 0.05;
  const fadeOutDuration = 0.5;
  const loop = false;
  const order = 'ascending';  // ascending or random
  const minAudioFiles = 1; // start at 0
  const maxAudioFiles = 5; //
  const synthMode = 'short'; //short or long
  const thresholdIntensity = 1e-3;


  // initialization
  const adjustLevelLin = helpers.math.decibelToLinear(adjustLevelDB); 
  const audioContext = graph.como.audioContext;
  
  
  //for kick detection 
  const movingAverage = new helpers.algo.MovingAverage(3); //to change to median !!!
  let triggered = false;
  let peak = 0;
  let triggerTime = 0;

  let currentLabel = null;
  const synth = new helpers.synth.BufferPlayer(audioContext);
  synth.connect(audioOutNode);
  
  // buffers managements
  const audioFiles = graph.session.get('audioFiles') 
  const audioFilesSorted = audioFiles.sort();  // necessary ?
  const totalAudioFiles = audioFilesSorted.length;
  const bufferNamesSelection = audioFilesSorted.slice(minAudioFiles, Math.min(maxAudioFiles + 1, totalAudioFiles));
  //console.log(bufferNamesSelection);
  const bufferNames = graph.session.audioBuffers
  let bufferNamesTemp = '';
  let bufferName = '';


  return {
    updateParams(updates) {

    },
    process(inputFrame) {
      //const enhancedIntensity = inputFrame.data['intensity'][1];
      //const gain = inputFrame.data['intensity'][0];
      const alpha = inputFrame.data['rotationRate'].alpha;
      const beta = inputFrame.data['rotationRate'].beta;
      const gamma = inputFrame.data['rotationRate'].gamma;
      const intensityGyro = Math.sqrt((alpha*alpha + beta*beta + gamma*gamma)/3) / 360; 
      const clipped = Math.max(thresholdIntensity, intensityGyro) - thresholdIntensity;
      
      const signal = clipped; //to trigger
      const gain = signal; //to adjust volume at start
      
      const median = movingAverage.process(signal); // changr to median
      const delta = signal - median;       
      //console.log(delta);

      const timeInterval = audioContext.currentTime - triggerTime;
      if (delta > threshold) {
        if (signal > peak && !triggered && timeInterval > minTimeInterval) {
          peak = signal;
          triggerTime = audioContext.currentTime;
          triggered = true;
          
          // choosing buffer
          if (order === 'random') {
            if (bufferNamesTemp.length > 0) {
              const index = Math.floor(bufferNamesTemp.length * Math.random()); 
              bufferName = bufferNamesTemp[index];
              bufferNamesTemp.splice(index,1);
            } else {
              bufferNamesTemp = bufferNamesSelection.slice(0);
              const index = Math.floor(bufferNamesTemp.length * Math.random()); 
              bufferName = bufferNamesTemp[index];
              bufferNamesTemp.splice(index,1);
            }
          }
          //console.log(bufferNamesSelection);
          if (order === 'ascending') {
            if (bufferNamesTemp.length > 0) {
              bufferName = bufferNamesTemp[0];
              bufferNamesTemp.splice(0,1);
            } else {
              bufferNamesTemp = bufferNamesSelection.slice(0);
              bufferName = bufferNamesTemp[0];
              bufferNamesTemp.splice(0,1);  
            }
          }
          const buffer = bufferNames[bufferName.name]; 
          //console.log(bufferName);       
          // playing buffer
          synth.start(buffer, { fadeInDuration: fadeInDuration, loop: loop, gain: gain * adjustLevelLin }); 
  
        } 
      }  else {
        triggered = false;
        peak = 0;  
        if (synthMode === 'short') {
          synth.stop({ fadeOutDuration: fadeOutDuration });  
        }
      }   
    },
    destroy() {
      synth.stop({ fadeOutDuration: 0 });
      synth.disconnect();
    },
  }
}
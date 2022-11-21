function kickSamples(graph, helpers, audioInNode, audioOutNode, outputFrame) {

  // user const 
  const adjustLevelDB = 0; // [db]:  < 0 softer, > 0 louder
  const threshold = 0.05;
  const minTimeInterval = 0.5;
  const fadeInDuration = 0.1;
  const fadeOutDuration = 1;
  const loop = false;
  const order = 'random';  // ascending or random
  const minAudioFiles = 19; // start at 0
  const maxAudioFiles = 25; //
  const synthMode = 'short'; //short or long


  // initialization
  const adjustLevelLin = helpers.math.decibelToLinear(adjustLevelDB); 
  const buffers = graph.session.audioFilesByLabel;
  const audioContext = graph.como.audioContext;
  
  
  //for kick detection 
  const movingAverage = new helpers.algo.MovingAverage(5); //to change to median !!!
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
      const enhancedIntensity = inputFrame.data['intensity'].compressed;
      const gain = Math.min(inputFrame.data['intensity'].linear, 1);
      const median = movingAverage.process(enhancedIntensity); // changr to median
      const delta = enhancedIntensity - median;       
      //console.log(delta);

      const timeInterval = audioContext.currentTime - triggerTime;
      if (delta > threshold) {
        if (enhancedIntensity > peak && !triggered && timeInterval > minTimeInterval) {
          peak = enhancedIntensity;
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
          console.log(bufferNamesSelection);
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
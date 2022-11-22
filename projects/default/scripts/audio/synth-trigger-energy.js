function kickSamples(graph, helpers, audioInNode, audioOutNode, outputFrame) {

  // user parameters
  const adjustLevelDB = 0; // [db]:  < 0 softer, > 0 louder
  const order = 'ascending';  // ascending or random
  const minAudioFiles = 3; // start at 0,  if order = ascending
  const maxAudioFiles = 10; // if order = ascending
  const threshold = 0.01; //  threshold for triggerng
  const movingMedianSize = 3; // min is >3, shortest latency
  const minTimeInterval = 0.3; // [s], time between two triggering events 
  const fadeInDuration = 0.05; // fadeIn of sound trigger
  const synthMode = 'fadeout'; // otherwise, the whole sample is played
  const fadeOutDuration = 1; // fadeoutDuration if synthMode = 'fadeout'
  const loop = false;



  // if you think you want to touch that, create a new script
  // in your prefered editor or at https://10.10.0.1/script-editor
  const adjustLevelLin = helpers.math.decibelToLinear(adjustLevelDB); 
  const audioContext = graph.como.audioContext;
  
  
  //for kick detection 
  const movingMedian = new helpers.algo.MovingMedian(movingMedianSize); //
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
      const compressedIntensity = inputFrame.data['intensity'].compressed; //used for detection
      const linearIntensity = Math.min(inputFrame.data['intensity'].linear, 1);  // used to modulate the energy
      const median = movingMedian.process(compressedIntensity); // changed to median
      const delta = compressedIntensity - median;       

      const timeInterval = audioContext.currentTime - triggerTime;
      if (delta > threshold) {
        if (compressedIntensity > peak && !triggered && timeInterval > minTimeInterval) {
          peak = compressedIntensity;
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
          synth.start(buffer, { fadeInDuration, loop, gain: linearIntensity * adjustLevelLin }); 
  
        } 
      }  else {
        triggered = false;
        peak = 0;  
        if (synthMode === 'fadeout') {
          synth.stop({ fadeOutDuration });  
        }
      }   
    },
    destroy() {
      synth.stop({ fadeOutDuration : 0});
      synth.disconnect();
    },
  }
}
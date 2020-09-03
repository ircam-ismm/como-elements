function kickSamples(graph, helpers, audioInNode, audioOutNode, outputFrame) {

  const buffers = graph.session.audioFilesByLabel;
  const audioContext = graph.como.audioContext;
  
  // prompt('password')
  
  //for kick detection 
  const movingAverage = new helpers.algo.MovingAverage(5); //to change to median !!!
  const threshold = 0.01;
  let triggered = false;
  let peak = 0;

  let currentLabel = null;
  const synth = new helpers.synth.BufferPlayer(audioContext);
  synth.connect(audioOutNode);
  
  const bufferNames = Object.keys(buffers);
  //console.log(bufferNames)

  return {
    process(inputFrame) {      
      const enhancedIntensity = inputFrame.data['intensity'][1];
      const median = movingAverage.process(enhancedIntensity);
      const delta = enhancedIntensity - median;       
      //console.log(delta);
      
      if (delta > threshold) {
        if (enhancedIntensity > peak && !triggered) {
          peak = enhancedIntensity;
          triggered = true;
          const volume = Math.pow(inputFrame.data['intensity'][1],1)*5;
          const bufferName = bufferNames[Math.floor(bufferNames.length * Math.random())];
          const buffer = buffers[bufferName][0];
          //synth.start(buffer, { fadeInDuration: 0.2, loop: false }); 

          const gain = audioContext.createGain();
          const src = audioContext.createBufferSource();
          src.connect(gain);
          gain.connect(audioContext.destination);
          
          gain.gain.value = volume;
          src.buffer = buffer;
          src.start(audioContext.currentTime);

        } 
      } else {
        triggered = false;
        peak = 0;  
        //synth.stop({ fadeOutDuration: 1 });  
      }   
    },
    destroy() {
      synth.stop({ fadeOutDuration: 0 });
      synth.disconnect();
    },
  }
}
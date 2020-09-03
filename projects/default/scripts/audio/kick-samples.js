function kickSamples(graph, helpers, audioInNode, audioOutNode, outputFrame) {

  const buffers = graph.session.audioFilesByLabel;
  const audioContext = graph.como.audioContext;
  
  //for kick detection 
  const movingAverage = new helpers.algo.MovingAverage(5); //to change to median !!!
  const threshold = 0.05;
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
      // var gain = Math.pow(inputFrame.data['intensity'][0];,1/2) * 10 ; // to add
      const median = movingAverage.process(enhancedIntensity);
      const delta = enhancedIntensity - median;       
      console.log(delta);
      
      if (delta > threshold) {
        if (enhancedIntensity > peak && !triggered) {
          peak = enhancedIntensity;
          triggered = true;
          const bufferName = bufferNames[Math.floor(bufferNames.length * Math.random())];
          const buffer = buffers[bufferName][0];
          synth.start(buffer, { fadeInDuration: 0.2, loop: false }); 
        } 
      }  else {
      triggered = false;
      peak = 0;  
      synth.stop({ fadeOutDuration: 1 });  
      }   
    },
    destroy() {
      synth.stop({ fadeOutDuration: 0 });
      synth.disconnect();
    },
  }
}
function kickSamples(graph, helpers, audioInNode, audioOutNode, outputFrame) {

  // user parameters
  const minNumBuffer = 0;
  const maxNumBuffer = 11;
  const order = 'ascending'



  // 
  const buffers = graph.session.audioFilesByLabel;
  const audioContext = graph.como.audioContext;
  
  // prompt('password')
  
  //for kick detection 
  const movingAverage = new helpers.algo.MovingAverage(5); //to change to median !!!
  const threshold = 0.01;
  let triggered = false;
  let peak = 0;

  // adjusting oveall levl
  const levelAdjust = 6; // dB

  let currentLabel = null;
  const synth = new helpers.synth.BufferPlayer(audioContext);
  synth.connect(audioOutNode);
  
  const bufferNames = Object.keys(buffers);
  console.log(bufferNames);

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
          
          //create and choosing buffer 
          if (order === 'random') {
                  if (bufferNamesTemp.length > 0) {
                    const index = Math.floor(bufferNamesTemp.length * Math.random()); 
                    bufferName = bufferNamesTemp[index];
                    bufferNamesTemp.splice(index,1);
                  } else {
                    bufferNamesTemp = bufferNamesSelection;
                    const index = Math.floor(bufferNamesTemp.length * Math.random()); 
                    bufferName = bufferNamesTemp[index];
                    bufferNamesTemp.splice(index,1);
                  }
                } 
                if (order === 'ascending') {
                  if (bufferNamesTemp.length > 0) {
                    bufferName = bufferNamesTemp[0];
                    bufferNamesTemp.splice(0,1);
                  } else {
                    bufferNamesTemp = bufferNamesSelection;
                    bufferName = bufferNamesTemp[0];
                    bufferNamesTemp.splice(0,1);
                  }
                }  




          const bufferName = bufferNames[Math.floor(bufferNames.length * Math.random())];
          //const bufferName = bufferNames[Math.floor(totalNumBuffers * Math.random()) + minNumBuffer];
          console.log(bufferName);
          const buffer = buffers[bufferName][0];

          //audio energy
          const volume = Math.pow(inputFrame.data['intensity'][0],1/2) * Math.pow(levelAdjust / 20, 10);
          
          // playing buffer
          const src = audioContext.createBufferSource();
          const gain = audioContext.createGain();
          src.connect(gain);
          gain.connect(audioContext.destination);
          src.buffer = buffer;
          gain.gain.value = volume;  // ? setValueAtTime
          src.start(audioContext.currentTime);

          // buffer won't stop, be careful

        } 
      } else {
        triggered = false;
        peak = 0;  
        //synth.stop({ fadeOutDuration: 1 });  
      }   
    },
    destroy() {
      // 
    },
  }
}
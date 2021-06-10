function kickSamples(graph, helpers, audioInNode, audioOutNode, outputFrame) {
  
  //for kick detection
  const movingAverage = new helpers.algo.MovingMedian(5);
  const threshold = 0.05;
  let triggered = false;
  let peak = 0;  //for kick detection

  

  const audioFiles = graph.session.get('audioFiles') 
  const audioFilesSorted = audioFiles.sort();
  const bufferNames = graph.session.audioBuffers
  //const labels = graph.session.get('labels')
  //const labelAudioFileTable = graph.session.get('labelAudioFileTable')  // array of array
  
  //const audioFileNames = graph.session.labelAudioFileTable.query(labels[0])
  //const audioBuffers = graph.session.labelAudioFileTable.queryBuffers(labels[0])


  const audioContext = graph.como.audioContext;
  const synth = new helpers.synth.BufferPlayer(audioContext);
  synth.connect(audioOutNode);


  return {
    updateParams(updates) {

    },
    process(inputFrame) {
      const enhancedIntensity = inputFrame.data['intensity'].compressed;
      // const gain = Math.pow(inputFrame.data['intensity'].high, 1/2) * 10; // to add
      const median = movingAverage.process(enhancedIntensity);
      const delta = enhancedIntensity - median;

      if (delta > threshold) {
        if (enhancedIntensity > peak && !triggered) {
          peak = enhancedIntensity;
          triggered = true;
          const audioFile = audioFilesSorted[Math.floor(audioFilesSorted.length * Math.random())];
          const buffer = bufferNames[audioFile.name]


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
function synthGestureRecognition(graph, helpers, audioInNode, audioOutNode, outputFrame) {
  
  // user parameters
  const fadeInDuration = 0.1; // [s]
  const fadeOutDuration = 0.5;  // [s]
  const loop = true;
  const windowSize = 50;
  const threshold = 0.6; //%
  const order = 'ascending'; // or 'ascending'
  // if you think you want to touch that, create a new script
  // in your prefered editor or at https://10.10.0.1/script-editor
  
  const audioContext = graph.como.audioContext;
  let currentLabel = undefined;
  let labelsCounters = {};
  let slidingWindow = new Array(windowSize).fill(0)
  let slidingWindowIndex = 0
  
  function histogram(data) {

    const max = Math.max(...data)
    const histogram = new Array(max + 1).fill(0);
    for (const item of data) {
        histogram[item]++;
    }
    const maxHistogram = Math.max(...histogram)
    const indexMaxHistogram = histogram.indexOf(maxHistogram)
    
    return {'maxHistogram': maxHistogram, 'indexMaxHistogram':indexMaxHistogram};
  }


  const synth = new helpers.synth.BufferPlayer(audioContext);
  synth.connect(audioOutNode);

  return {
    updateParams(updates) {

    },
    process(inputFrame) {
      const labelUnfiltered =  inputFrame.data['ml-decoder'].likeliest; 
      const labels = inputFrame.data['ml-decoder'].labels; 
      const indexLikeliest = labels.indexOf(labelUnfiltered);
      
      slidingWindow[slidingWindowIndex] = indexLikeliest;
      slidingWindowIndex = (slidingWindowIndex + 1) % windowSize;

      const maxHistogramNormalised = histogram(slidingWindow).maxHistogram/windowSize;
      const indexMaxHistogram = histogram(slidingWindow).indexMaxHistogram;

      let label = null;
      if (maxHistogramNormalised > threshold){
        label = labels[indexMaxHistogram];
      };

      if (currentLabel !== label) {
        currentLabel = label;

        let buffer = null;

        if (order === 'random') {
          // query all buffers related to the label, and pick a random buffer one
          const buffers = graph.session.labelAudioFileTable.queryBuffers(label);
          const index = Math.floor(Math.random() * buffers.length);
          buffer = buffers[index];
        } else if (order === 'ascending') {
          if (!labelsCounters[label]) {
            labelsCounters[label] = 0;
          }

          const index = labelsCounters[label];
          const filenames = graph.session.labelAudioFileTable.query(label);
          const sorted = filenames.sort();
          const filename = sorted[index];
          buffer = graph.session.audioBuffers[filename];

          labelsCounters[label] = (labelsCounters[label] + 1) % sorted.length;
        }
        console.log(label,buffer);
        synth.stop({ fadeOutDuration });

        if (buffer) {
          synth.start(buffer, { fadeInDuration, loop });
        }
      }
    },
    destroy() {
      synth.stop({ fadeOutDuration : 0});
      synth.disconnect();
    },
  };
}
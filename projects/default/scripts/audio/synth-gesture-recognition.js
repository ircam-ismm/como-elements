function synthGestureRecognition(graph, helpers, audioInNode, audioOutNode, outputFrame) {
  
  // user parameters
  const fadeInDuration = 0.2; // [s]
  const fadeOutDuration = 1;  // [s]
  const loop = true;

  const order = 'ascending'; // or 'ascending'
  // if you think you want to touch that, create a new script
  // in your prefered editor or at https://10.10.0.1/script-editor
  const audioContext = graph.como.audioContext;
  let currentLabel = undefined;
  let labelsCounters = {};

  const synth = new helpers.synth.BufferPlayer(audioContext);
  synth.connect(audioOutNode);

  return {
    updateParams(updates) {

    },
    process(inputFrame) {
      const label = inputFrame.data['ml-decoder'].likeliest;

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

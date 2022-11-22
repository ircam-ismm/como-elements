function synthGestureRecognition(graph, helpers, audioInNode, audioOutNode, outputFrame) {
  
  // user parameters
  const fadeInDuration = 0.2; // [s]
  const fadeOutDuration = 1;  // [s]
  const loop = true;

  // if you think you want to touch that, create a new script
  // in your prefered editor or at https://10.10.0.1/script-editor
  const audioContext = graph.como.audioContext;
  let currentBuffer = undefined;

  const synth = new helpers.synth.BufferPlayer(audioContext);
  synth.connect(audioOutNode);

  return {
    updateParams(updates) {

    },
    process(inputFrame) {
      const label = inputFrame.data['ml-decoder'].likeliest;
      // query all buffers related to the label, and pick a random buffer one
      const buffers = graph.session.labelAudioFileTable.queryBuffers(label);
      const index = Math.floor(Math.random() * buffers.length);
      const buffer = buffers[index];

      if (currentBuffer !== buffer) {
        currentBuffer = buffer;
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
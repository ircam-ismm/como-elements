function synthLikeliestLoop(graph, helpers, audioInNode, audioOutNode, outputFrame) {

  const buffers = graph.session.audioFilesByLabel;
  const audioContext = graph.como.audioContext;

  let currentLabel = null;
  const synth = new helpers.synth.BufferPlayer(audioContext);
  synth.connect(audioOutNode);

  return {
    updateParams(updates) {

    },
    process(inputFrame) {
      const label = inputFrame.data['ml-decoder'].likeliest;

      if (currentLabel !== label) {
        currentLabel = label;
        synth.stop({ fadeOutDuration: 1 });

        if (label !== null && buffers[label]) {
          // choose a buffer in the list related to the label
          const labelBuffers = buffers[label];
          const index = Math.floor(Math.random() * labelBuffers.length);
          const buffer = labelBuffers[index];

          synth.start(buffer, { fadeInDuration: 0.2, loop: true });
        }
      }
    },
    destroy() {
      synth.stop({ fadeOutDuration: 0 });
      synth.disconnect();
    },
  }
}
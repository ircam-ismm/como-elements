function synthLikeliestLoop(graph, helpers, audioInNode, audioOutNode, outputFrame) {
  // console.log(graph.session.audioBuffers);
  const audioContext = graph.como.audioContext;
  const syncPlugin = graph.commo.experience.plugins.sync;
  let currentBuffer = undefined;

  const synth = new helpers.synth.SyncedBufferPlayer(syncPlugin, audioContext);
  synth.connect(audioOutNode);

  return {
    updateParams(updates) {

    },
    process(inputFrame) {
      const label = inputFrame.data['ml-decoder'].likeliest;
      // query all buffers related to the label, and pick a random buffer one
      const filenames = graph.session.labelAudioFileTable.query(label);
      const buffers = graph.session.labelAudioFileTable.queryBuffers(label);
//       console.log(filenames, buffers);
      const index = Math.floor(Math.random() * buffers.length);
      const buffer = buffers[index];

      if (currentBuffer !== buffer) {
        currentBuffer = buffer;
        synth.stop({ fadeOutDuration: 1 });

        if (buffer) {
          synth.start(buffer, { fadeInDuration: 0.2, loop: true });
        }
      }
    },
    destroy() {
      synth.stop({ fadeOutDuration: 0 });
      synth.disconnect();
    },
  };
}


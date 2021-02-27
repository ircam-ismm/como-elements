function audioDefault(graph, helpers, audioInNode, audioOutNode, outputFrame) {

  const audioContext = graph.como.audioContext;
  // @example
  // var synth = new helpers.synths.LoopSynth();
  // synth.connect(audioOutNode);
  // let myParam = 0;

  return {
    updateParams(updates) {
      // myParam = updates.myParam;
    },
    process(inputFrame, outputFrame) {
      // called on each sensor frame
    },
    destroy() {
      // if anything should be done when

      // @example
      // synth.stop();
      // synth.disconnect();
    },
  }
}
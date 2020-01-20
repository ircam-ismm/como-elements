function audioDefault(graph, helpers, audioInNode, audioOutNode, outputFrame) {
  // @warning - this script won't be transpiled, so it needs to be compliant
  // with every javascript engine it might run on (i.e. watch out for Safari!)

  const audioContext = graph.como.audioContext;
  // @example
  // const synth = new helpers.synths.LoopSynth();
  // synth.connect(audioOutNode);

  return {
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

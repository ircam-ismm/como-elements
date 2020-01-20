function audioDefault(graph, helpers, audioInNode, audioOutNode, outputFrame) {
  // @warning - this script won't be transpiled (for now), so it needs to be compliant
  // with every javascript engine it might run on.
  // For example, this example will probably not work on Safari...

  const audioContext = graph.como.audioContext;
  const movingAverage = new helpers.algo.MovingAverage(12);
  const envelop = audioContext.createGain();

  audioInNode.connect(envelop);
  envelop.connect(audioOutNode);
  envelop.gain.value = 0;
  envelop.gain.setValueAtTime(0, audioContext.currentTime);

  return {
    process(inputFrame, outputFrame) {
      const now = audioContext.currentTime;
      const enhancedIntensity = inputFrame.data['intensity'][1];
      const avg = movingAverage.process(enhancedIntensity);

      // we know that we have a frame every 20ms so a ramp of 10ms should be safe
      envelop.gain.linearRampToValueAtTime(avg, now + 0.01);
    },
    destroy() {
      envelop.gain.setValueAtTime(0, audioContext.currentTime);

      audioInNode.disconnect(envelop);
      envelop.disconnect();

    },
  }
}

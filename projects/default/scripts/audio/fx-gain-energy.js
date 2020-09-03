function fxGainEnergy(graph, helpers, audioInNode, audioOutNode, outputFrame) {

  const audioContext = graph.como.audioContext;
  const movingAverage = new helpers.algo.MovingAverage(12);
  const envelop = audioContext.createGain();

  audioInNode.connect(envelop);
  envelop.connect(audioOutNode);
  envelop.gain.value = 0;
  envelop.gain.setValueAtTime(0, audioContext.currentTime);

  return {
    process(inputFrame, outputFrame) {
      var now = audioContext.currentTime;
      var enhancedIntensity = inputFrame.data['intensity'][1];
      var avg = movingAverage.process(enhancedIntensity);

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
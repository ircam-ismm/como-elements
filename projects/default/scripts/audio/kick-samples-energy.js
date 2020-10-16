function kickSamples(graph, helpers, audioInNode, audioOutNode, outputFrame) {

  const buffers = graph.session.audioFilesByLabel;
  const audioContext = graph.como.audioContext;

  // for kick detection
  const movingAverage = new helpers.algo.MovingMedian(5);
  const threshold = 0.01;
  let triggered = false;
  let peak = 0;

  const synth = new helpers.synth.BufferPlayer(audioContext);
  synth.connect(audioOutNode);

  const bufferNames = Object.keys(buffers);

  return {
    process(inputFrame) {
      const enhancedIntensity = inputFrame.data['intensity'].compressed;
      const median = movingAverage.process(enhancedIntensity);
      const delta = enhancedIntensity - median;

      if (delta > threshold) {
        if (enhancedIntensity > peak && !triggered) {
          peak = enhancedIntensity;
          triggered = true;

          const volume = Math.pow(enhancedIntensity, 1) * 5;
          const bufferName = bufferNames[Math.floor(bufferNames.length * Math.random())];
          const buffer = buffers[bufferName][0];

          const gain = audioContext.createGain();
          gain.connect(audioOutNode);
          gain.gain.value = volume;

          const src = audioContext.createBufferSource();
          src.connect(gain);
          src.buffer = buffer;
          src.start(audioContext.currentTime);
          //synth.start(buffer, { fadeInDuration: 0.2, loop: false });
        }
      } else {
        triggered = false;
        peak = 0;
      }
    },
    destroy() {
      synth.stop({ fadeOutDuration: 0 });
      synth.disconnect();
    },
  }
}
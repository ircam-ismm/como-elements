function testScriptParams(graph, helpers, outputFrame) {

  let myParam = 0;
  let logProcess = true;

  return {
    updateParams(updates) {
      console.log('updates', updates);
      myParam = updates.myParam;
      logProcess = true;
    },
    process(inputFrame, outputFrame) {
      // called on each sensor frame
      if (logProcess) {
        console.log('process', myParam);
        logProcess = false;
      }
    },
    destroy() {
      console.log('destroy');
      // if anything should be done when
    },
  }
}

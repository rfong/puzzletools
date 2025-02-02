export default function beep(durationMs) {
  var ctx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
  var osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 800;
  osc.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + durationMs/1000.0);
}

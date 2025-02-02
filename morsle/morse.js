/******************************
 * Constants
 */

// Dot duration in seconds
let DOT_LEN,
// Dash len
    DASH_LEN,
// Letter break len
    SEP_LEN,
// Space character len
    SPACE_LEN;

/******************************
 * Fetch local data
 */

fetch('./morse.json')
.then(resp => {
  if (!resp.ok) {
    throw new Error("HTTP error:", response.status);
  }
  return resp.json();
})
.then(json => {
  window.data = {morse: json};
  // populate cheat sheet
  let cheatsheet = document.getElementById("cheatsheet");
  for (const key of "abcdefghijklmnopqrstuvwxyz") {
    var el = document.createElement('div');
    el.textContent = key.toUpperCase() + " " + window.data.morse[key];
    cheatsheet.appendChild(el);
  }
});

/******************************
 * Beep
 */

var ctx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);

function getBeeper() {
  let osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 800;
  return osc;
}

function beep(duration, now) {
  console.log("beep", now, now + duration);
  let osc = getBeeper();
  osc.connect(ctx.destination);
  now = now || ctx.currentTime;
  osc.start(now);
  osc.stop(now + duration);
}

function dot(now) {
  beep(DOT_LEN, now);
}
function dash(now) {
  beep(DASH_LEN, now);
}

export default function beepMsg(msg) {
  let start = ctx.currentTime,
      now = ctx.currentTime,
      osc = getBeeper();
  for (const ch of msg) {
    console.log(ch, window.data.morse[ch]);
    // if ch is a space, do a word break
    if (ch == " ") {
      now += SPACE_LEN;
      continue;
    }
    let chMorse = window.data.morse[ch];
    for (const blip of chMorse) {
      if (blip == ".") {
        dot(now);
        now += DOT_LEN;
      } else if (blip == "-") {
        dash(now);
        now += DASH_LEN;
      } else {
        throw new Error("unexpected character found in morse lookup:", blip);
      }
      // morse break
      now += DOT_LEN;
    }
    // char break
    now += SEP_LEN;
  }
  // Return duration of message in seconds
  return now - start;
}

let onSpeedChange = function() {
  DOT_LEN = (this ? parseFloat(this.value) : 0.1);
  DASH_LEN = 3 * DOT_LEN;
  SEP_LEN = 3 * DOT_LEN;
  SPACE_LEN = 7 * DOT_LEN;
  document.getElementById("speedValue").textContent = DOT_LEN + " ms";
};
document.getElementById("speed").oninput = onSpeedChange;
document.getElementById("speed").onchange = onSpeedChange;
// Set initial values
onSpeedChange();

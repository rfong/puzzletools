import beepMsg from './morse.js';

// Handle page functions
document.getElementById("sayMsg").onclick = function() {
  // Disable the button while beeping
  document.getElementById("sayMsg").disabled = true;
  // Send message beeping instructions
  let msg = document.getElementById("msg").value.toLowerCase();
  let durationSec = beepMsg(msg);
  // Re-enable button after timeout
  setTimeout(() => {
    document.getElementById("sayMsg").disabled = false;
  }, durationSec * 1000);
};

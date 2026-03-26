// Cycles through status messages to simulate an active loading process.
// The page never resolves — this is intentional (see security note on the page).
const statusTexts = [
  "Initializing...",
  "Connecting to servers...",
  "Loading your profile...",
  "Preparing your feed...",
  "Almost ready...",
  "Finalizing setup...",
  "Checking for updates...",
  "Syncing data...",
  "Loading preferences...",
  "Connecting to friends...",
  "Preparing notifications...",
  "Loading settings...",
  "Checking permissions...",
  "Verifying account...",
  "Loading content...",
  "Preparing interface..."
];

let currentIndex = 0;
const statusElement = document.querySelector('.status-text');

setInterval(function () {
  statusElement.textContent = statusTexts[currentIndex];
  currentIndex = (currentIndex + 1) % statusTexts.length;
}, 2000);

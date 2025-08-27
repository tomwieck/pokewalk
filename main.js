
const streetEl = document.getElementById('street');
const startBtn = document.getElementById('startBtn');
const manualBtn = document.getElementById('manualChangeBtn');

let prevStreet = null;
let audio = new Audio();
audio.loop = true; // Make MP3 loop continuously
let watchId = null;

const sounds = [
  './sounds/dewford_town.mp3',
  './sounds/diving.mp3',
  './sounds/fortree_city.mp3',
  './sounds/lilycove_city.mp3',
  './sounds/littleroot_town.mp3',
  './sounds/mt_chimney.mp3',
  './sounds/oceanic.mp3',
  './sounds/oldale_town.mp3',
  './sounds/petalburg.mp3',
  './sounds/route_101.mp3',
  './sounds/route_104.mp3',
  './sounds/route_110.mp3',
  './sounds/route_113.mp3',
  './sounds/route_119.mp3',
  './sounds/route_120.mp3',
  './sounds/rustboro.mp3',
  './sounds/slateport.mp3',
  './sounds/verdanturf.mp3',
  './sounds/victory.mp3'
]

// Sample streets for manual testing
const testStreets = ['Main St', 'Broadway', '1st Avenue', 'Elm Street'];

// Reverse geocode function (simulated for manual test)
async function reverseGeocode(lat, lon) {
  // On manual test, pick a random street from testStreets
  return testStreets[Math.floor(Math.random() * testStreets.length)];
}

// Play a random MP3
function playRandomSound() {
  const idx = Math.floor(Math.random() * sounds.length);
  audio.src = sounds[idx];
  audio.play().catch(console.error);
}

// Stop the current sound
function stopSound() {
  audio.pause();
  audio.currentTime = 0;
}

// Start live Geolocation tracking
startBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported in this browser.');
    return;
  }

  startBtn.disabled = true;

  watchId = navigator.geolocation.watchPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const street = await reverseGeocode(latitude, longitude);

    if (street !== prevStreet) {
      prevStreet = street;
      streetEl.textContent = street;
      stopSound();
      playRandomSound();
    }
  }, (error) => {
    console.error(error);
    alert('Error getting location: ' + error.message);
  }, {
    enableHighAccuracy: true,
    maximumAge: 1000,
    timeout: 5000,
  });
});

// Manual street change for testing
manualBtn.addEventListener('click', async () => {
  // Pick a different street than the current one
  let newStreet;
  do {
    newStreet = testStreets[Math.floor(Math.random() * testStreets.length)];
  } while (newStreet === prevStreet);

  prevStreet = newStreet;
  streetEl.textContent = newStreet;

  stopSound();
  playRandomSound();
});

// Stop tracking and sound on page unload
window.addEventListener('beforeunload', () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
  stopSound();
});

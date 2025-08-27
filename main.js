// make sure sounds is defined

const streetEl = document.getElementById('street');
const startBtn = document.getElementById('startBtn');
const currentSongEl = document.getElementById('currentSong');

let prevStreet = null;
let audio = new Audio();
audio.loop = true; // MP3 loops continuously
let watchId = null;

// Leaflet map setup (unchanged)
let map = L.map('map').setView([0, 0], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
let marker = L.marker([0, 0]).addTo(map);

// Reverse geocode function
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers: { 'User-Agent': 'BrowserStreetTracker/1.0' } }
    );
    const data = await res.json();
    return data?.address?.road || 'Unknown street';
  } catch (err) {
    console.error(err);
    return 'Error fetching street';
  }
}

// Convert file name to sentence case
// TODO add gen
function formatSongName(filePath) {
  const parts = filePath.split('/').pop().split('.')[0].split('_');
  const formatted = parts.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  return formatted;
}

// Play a random MP3
function playRandomSound() {
  const idx = Math.floor(Math.random() * sounds.length);
  audio.src = sounds[idx];
  audio.play().catch(console.error);

  // Update currently playing
  currentSongEl.textContent = 'Currently Playing: ' + formatSongName(sounds[idx]);
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

  watchId = navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      // Update street
      const street = await reverseGeocode(latitude, longitude);
      if (street !== prevStreet) {
        prevStreet = street;
        streetEl.textContent = street;
        stopSound();
        playRandomSound();
      }

      // Update map
      marker.setLatLng([latitude, longitude]);
      map.setView([latitude, longitude]);
    },
    (error) => {
      console.error(error);
      alert('Error getting location: ' + error.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000,
    }
  );
});

// Stop tracking and sound on page unload
window.addEventListener('beforeunload', () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
  stopSound();
});

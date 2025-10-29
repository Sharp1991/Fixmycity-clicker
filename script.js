import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ✅ your Supabase credentials
const SUPABASE_URL = 'https://kdjwrgcyhtrxfjvhonfh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SqTmlMsLjOXafXiv1vwxcg_--j67cTK';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM elements
const clickButton = document.getElementById('clickButton');
const statusDiv = document.getElementById('status');

// get GPS position continuously
let currentPosition = { lat: null, lon: null };

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (pos) => {
      currentPosition = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      };
      statusDiv.innerHTML = `📍 Lat: ${currentPosition.lat.toFixed(6)}, Lon: ${currentPosition.lon.toFixed(6)}`;
    },
    (err) => {
      console.error(err);
      statusDiv.innerHTML = "❌ Location access denied.";
    },
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
  );
} else {
  alert("Geolocation not supported on this device.");
}

// handle click
clickButton.addEventListener('click', async () => {
  if (!currentPosition.lat || !currentPosition.lon) {
    alert('Waiting for GPS fix...');
    return;
  }

  const start = performance.now();

  try {
    const { error } = await supabase.from('road_clicks').insert([
      {
        lat: currentPosition.lat,
        lon: currentPosition.lon
      }
    ]);

    const end = performance.now();

    if (error) throw error;

    statusDiv.innerHTML = `✅ Click saved! (${(end - start).toFixed(1)} ms)`;
  } catch (err) {
    console.error(err);
    statusDiv.innerHTML = `⚠️ Failed to save: ${err.message}`;
  }
});

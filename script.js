import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔗 Supabase credentials (your working project)
const SUPABASE_URL = "https://kdjwrgcyhtrxfjvhonfh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_SqTmlMsLjOXafXiv1vwxcg_--j67cTK";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const btn = document.getElementById("clickBtn");
const statusText = document.getElementById("status");

// ✅ Send GPS data to Supabase
async function sendToSupabase(lat, lon) {
  const { error } = await supabase.from("click_data").insert([
    { lat: lat, lon: lon, created_at: new Date().toISOString() },
  ]);

  if (error) {
    console.error("Supabase insert error:", error);
    statusText.textContent = "⚠️ Failed to send to Supabase.";
  } else {
    statusText.textContent = `✅ Sent (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
  }
}

// ✅ Get current GPS location
function getAndSendLocation() {
  if (!navigator.geolocation) {
    statusText.textContent = "❌ GPS not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      sendToSupabase(lat, lon);
    },
    (err) => {
      console.error("GPS error:", err);
      statusText.textContent = "❌ GPS permission denied or unavailable.";
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

// ✅ Click handler
btn.addEventListener("click", () => {
  statusText.textContent = "📡 Getting GPS...";
  getAndSendLocation();
});

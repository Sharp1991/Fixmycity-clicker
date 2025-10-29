import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔹 Supabase credentials you provided
const SUPABASE_URL = "https://kdjwrgcyhtrxfjvhonfh.supabase.co";
const SUPABASE_KEY = "sb_publishable_SqTmlMsLjOXafXiv1vwxcg_--j67cTK";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 🔹 Your table name
const TABLE = "road_clicks"; // make sure this exists in Supabase

// --- DOM elements ---
const clickButton = document.getElementById("clickBtn");
const statusText = document.getElementById("status");

// --- Main click handler ---
clickButton.addEventListener("click", async () => {
  try {
    // Get current location
    if (!navigator.geolocation) {
      statusText.textContent = "❌ GPS not supported";
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      // Send to Supabase
      const { error } = await supabase.from(TABLE).insert([
        {
          lat,
          lon,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Supabase insert error:", error.message);
        statusText.textContent = "⚠️ Failed to send";
      } else {
        statusText.textContent = `✅ Click saved (${lat.toFixed(5)}, ${lon.toFixed(5)})`;
      }
    });
  } catch (err) {
    console.error("Click error:", err);
    statusText.textContent = "⚠️ Error saving data";
  }
});

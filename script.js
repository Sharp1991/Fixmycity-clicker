// Replace with your Supabase project credentials
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const button = document.getElementById("clicker");
const statusText = document.getElementById("status");

button.addEventListener("click", async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const timestamp = new Date().toISOString();

      const { data, error } = await supabase
        .from("road_points")
        .insert([{ latitude: lat, longitude: lon, timestamp }]);

      if (error) {
        console.error(error);
        statusText.textContent = "Error saving point!";
      } else {
        statusText.textContent = `✅ Marked: ${lat}, ${lon}`;
      }
    });
  } else {
    statusText.textContent = "Geolocation not supported.";
  }
});

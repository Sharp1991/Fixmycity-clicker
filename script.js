import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ✅ Your Supabase credentials
const SUPABASE_URL = 'https://kdjwrgcyhtrxfjvhonfh.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SqTmlMsLjOXafXiv1vwxcg_--j67cTK'

// Initialize client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const clickBtn = document.getElementById('clickBtn')
const statusEl = document.getElementById('status')

let lat = null
let lon = null

// ✅ Watch for GPS
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (pos) => {
      lat = pos.coords.latitude
      lon = pos.coords.longitude
      statusEl.textContent = `✅ GPS Ready (${lat.toFixed(5)}, ${lon.toFixed(5)})`
    },
    (err) => {
      statusEl.textContent = `❌ GPS Error: ${err.message}`
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
  )
} else {
  statusEl.textContent = '❌ GPS not supported on this device.'
}

// ✅ Handle click
clickBtn.addEventListener('click', async () => {
  if (lat === null || lon === null) {
    statusEl.textContent = '⚠️ Waiting for GPS...'
    return
  }

  try {
    const { error } = await supabase.from('road_clicks').insert([
      {
        lat: lat,
        lon: lon,
        created_at: new Date().toISOString()
      }
    ])

    if (error) {
      console.error(error)
      statusEl.textContent = '❌ Failed to send to Supabase.'
    } else {
      statusEl.textContent = `✅ Sent (${lat.toFixed(5)}, ${lon.toFixed(5)})`
    }
  } catch (err) {
    console.error(err)
    statusEl.textContent = '❌ Network error.'
  }
})

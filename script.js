import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://kdjwrgcyhtrxfjvhonfh.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SqTmlMsLjOXafXiv1vwxcg_--j67cTK'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const clickBtn = document.getElementById('clickBtn')
const statusEl = document.getElementById('status')
const resetGPSBtn = document.getElementById('resetGPS')

let lat = null
let lon = null
let gpsWatchId = null

// ✅ Initialize GPS
function initGPS() {
    if (!navigator.geolocation) {
        setStatus('❌ GPS not supported on this device.', 'error')
        return
    }

    setStatus('📍 Searching for GPS signal...', 'waiting')
    
    // Clear any existing watcher
    if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId)
    }

    gpsWatchId = navigator.geolocation.watchPosition(
        (pos) => {
            lat = pos.coords.latitude
            lon = pos.coords.longitude
            const accuracy = pos.coords.accuracy
            
            setStatus(`✅ READY TO PATS! (${lat.toFixed(5)}, ${lon.toFixed(5)}) ±${accuracy.toFixed(1)}m`, 'ready')
            clickBtn.disabled = false
            clickBtn.style.background = '#4CAF50'
            
            console.log('📍 GPS acquired:', { lat, lon, accuracy })
        },
        (err) => {
            console.error('GPS Error:', err)
            switch (err.code) {
                case err.PERMISSION_DENIED:
                    setStatus('❌ GPS: Permission denied. Allow location access.', 'error')
                    break
                case err.POSITION_UNAVAILABLE:
                    setStatus('❌ GPS: Location unavailable. Check signal.', 'error')
                    break
                case err.TIMEOUT:
                    setStatus('❌ GPS: Timed out. Click "Reset GPS" to retry.', 'error')
                    break
                default:
                    setStatus(`❌ GPS Error: ${err.message}`, 'error')
            }
            lat = null
            lon = null
            clickBtn.disabled = true
            clickBtn.style.background = '#cccccc'
        },
        { 
            enableHighAccuracy: true,
            maximumAge: 30000,
            timeout: 15000
        }
    )
}

// ✅ Set status with styling
function setStatus(message, type = 'waiting') {
    statusEl.textContent = message
    statusEl.className = type
}

// ✅ Manual GPS Reset
resetGPSBtn.addEventListener('click', () => {
    setStatus('🔄 Resetting GPS...', 'waiting')
    clickBtn.disabled = true
    clickBtn.style.background = '#cccccc'
    lat = null
    lon = null
    
    // Clear and restart GPS
    if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId)
    }
    
    setTimeout(initGPS, 1000)
})

// ✅ Handle Pats Recording
clickBtn.addEventListener('click', async () => {
    if (lat === null || lon === null) {
        setStatus('⚠️ Waiting for GPS...', 'waiting')
        return
    }

    try {
        setStatus('📡 Sending pats location...', 'waiting')
        clickBtn.disabled = true
        clickBtn.style.background = '#cccccc'

        const { error } = await supabase
            .from('road_clicks')
            .insert([
                {
                    lat: lat,
                    lon: lon,
                    created_at: new Date().toISOString()
                }
            ])

        if (error) {
            console.error('Insert error:', error)
            setStatus(`❌ Failed to send: ${error.message}`, 'error')
        } else {
            setStatus(`✅ PATS RECORDED! (${lat.toFixed(5)}, ${lon.toFixed(5)})`, 'ready')
            
            // Success animation
            clickBtn.style.background = '#4CAF50'
            setTimeout(() => {
                if (lat && lon) {
                    setStatus(`✅ READY TO PATS! (${lat.toFixed(5)}, ${lon.toFixed(5)})`, 'ready')
                    clickBtn.disabled = false
                }
            }, 2000)
        }
    } catch (err) {
        console.error('Unexpected error:', err)
        setStatus('❌ Network error - check connection', 'error')
    } finally {
        setTimeout(() => {
            if (lat && lon) {
                clickBtn.disabled = false
                clickBtn.style.background = '#4CAF50'
            }
        }, 2000)
    }
})

// ✅ Click on status to manually trigger GPS
statusEl.addEventListener('click', () => {
    if (!lat || !lon) {
        resetGPSBtn.click()
    }
})

// ✅ Start everything when page loads
initGPS()

// ✅ Test Supabase connection
async function testConnection() {
    const { data, error } = await supabase.from('road_clicks').select('count')
    if (error) {
        console.error('Supabase connection test failed:', error)
    } else {
        console.log('✅ Supabase connection successful')
    }
}
testConnection()

// Add this function to verify data is being inserted
async function verifyLastInsert() {
  console.log('🔍 Checking latest inserts...')
  
  const { data, error } = await supabase
    .from('road_clicks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Verification failed:', error)
  } else {
    console.log('📊 Latest 5 records:', data)
    if (data.length > 0) {
      statusEl.textContent = `✅ Verified! ${data.length} records in database`
    }
  }
}

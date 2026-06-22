#!/usr/bin/env node
// Test Supabase connectivity and schema status
import https from 'https';

const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhbnJpbGZ4c251bml0bG9hd2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MTM5ODMsImV4cCI6MjA2NjE4OTk4M30.VkB_3zp56ZFXI1UdMRj-YXoNs4tgpsFG4VqSBHsHxO4';

function apiGet(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'eanrilfxsnunitloawgy.supabase.co',
      path,
      method: 'GET',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Accept': 'application/json',
      }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('Testing Supabase connectivity...\n');

  // Check if tables exist via REST API
  const tables = ['trips', 'catch_logs', 'citizen_reports', 'emergency_incidents', 'profiles', 'sync_events'];
  for (const table of tables) {
    const res = await apiGet(`/rest/v1/${table}?select=count&limit=0`);
    if (res.status === 200) {
      console.log(`✅ Table exists: ${table}`);
    } else if (res.status === 404 || (res.body && res.body.includes('does not exist'))) {
      console.log(`❌ Table missing: ${table} (status ${res.status})`);
    } else if (res.status === 401) {
      // 401 on the anon key means RLS is enforced (table exists but user not signed in)
      console.log(`✅ Table exists: ${table} (RLS active — 401 expected for unauthenticated)`);
    } else {
      console.log(`⚠️  Table ${table}: HTTP ${res.status} — ${res.body.slice(0, 100)}`);
    }
  }
}

main().catch(console.error);

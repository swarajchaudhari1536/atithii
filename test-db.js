/**
 * test-db.js — standalone MongoDB connection debug script
 * Run with: node test-db.js
 */
const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');

// Load .env.local (Next.js convention)
try {
  require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
  console.log('[env] .env.local loaded');
} catch {
  // dotenv not installed – try reading the file manually
  const fs = require('fs');
  const envPath = path.resolve(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const [key, ...rest] = line.trim().split('=');
      if (key && rest.length) process.env[key] = rest.join('=');
    }
    console.log('[env] .env.local loaded manually (dotenv not installed)');
  }
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('[error] MONGODB_URI is not set — check your .env.local file');
  process.exit(1);
}

// Mask credentials for safe logging
const safeUri = uri.replace(/:\/\/([^:]+):([^@]+)@/, '://<user>:<pass>@');
console.log('[uri]', safeUri);

// ── Step 1: DNS check ──────────────────────────────────────────────────────
async function checkDns(uri) {
  if (!uri.startsWith('mongodb+srv://')) return;
  const host = uri.replace('mongodb+srv://', '').split('@').pop().split('/')[0];
  console.log(`[dns] Resolving SRV for _mongodb._tcp.${host} ...`);
  return new Promise((resolve) => {
    dns.setServers(['8.8.8.8', '1.1.1.1']); // use Google/Cloudflare DNS
    dns.resolveSrv(`_mongodb._tcp.${host}`, (err, records) => {
      if (err) {
        console.error('[dns] ❌ SRV resolution failed:', err.message);
        console.error('       → Check your internet connection or Atlas cluster status.');
      } else {
        console.log(`[dns] ✅ SRV records found (${records.length}):`);
        records.forEach(r => console.log(`       ${r.name}:${r.port}`));
      }
      resolve();
    });
  });
}

// ── Step 2: Mongoose connect ───────────────────────────────────────────────
async function testConnection() {
  await checkDns(uri);

  console.log('\n[mongoose] Connecting...');
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 45000,
    });

    const conn = mongoose.connection;
    console.log(`[mongoose] ✅ Connected!`);
    console.log(`           host   : ${conn.host}`);
    console.log(`           db     : ${conn.name}`);
    console.log(`           state  : ${conn.readyState}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n[mongoose] ❌ Connection FAILED');
    console.error('  message :', err.message);
    console.error('  name    :', err.name);
    console.error('  code    :', err.code ?? 'N/A');
    if (err.reason) {
      console.error('  reason  :', JSON.stringify(err.reason, null, 2));
    }
    console.error('\n── Possible fixes ─────────────────────────────────────────');
    console.error('  1. Whitelist your IP in MongoDB Atlas → Network Access');
    console.error('  2. Verify username/password in .env.local');
    console.error('  3. Check the cluster is not paused in Atlas');
    console.error('  4. Try adding "0.0.0.0/0" (allow all IPs) temporarily');
    console.error('───────────────────────────────────────────────────────────');
    process.exit(1);
  }
}

testConnection();

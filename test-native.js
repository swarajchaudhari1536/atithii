const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Manual dotenv loader
const envContent = fs.readFileSync(path.resolve(__dirname, '.env.local'), 'utf-8');
const lines = envContent.split('\n');
for (const line of lines) {
    const [key, ...rest] = line.trim().split('=');
    if (key && rest.length) process.env[key] = rest.join('=');
}

const uri = process.env.MONGODB_URI;
console.log('Testing URI (native):', uri.replace(/:\/\/([^:]+):([^@]+)@/, '://<user>:<pass>@'));

async function run() {
    const client = new MongoClient(uri, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 10000,
    });

    try {
        console.log('Attempting to connect with native driver...');
        await client.connect();
        console.log('✅ Successfully connected with native driver!');
        const db = client.db('smart_hotel');
        const cols = await db.listCollections().toArray();
        console.log('Collections Names:', cols.map(c => c.name));
    } catch (err) {
        console.error('❌ Connection FAILED');
        console.error(err);
    } finally {
        await client.close();
    }
}

run();

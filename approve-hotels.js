const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.resolve(__dirname, '.env.local'), 'utf-8');
const lines = envContent.split('\n');
for (const line of lines) {
    const [key, ...rest] = line.trim().split('=');
    if (key && rest.length) process.env[key] = rest.join('=');
}

async function run() {
    try {
        const shard0 = 'ac-ypgbeyh-shard-00-00.hqo48ws.mongodb.net:27017';
        const shard1 = 'ac-ypgbeyh-shard-00-01.hqo48ws.mongodb.net:27017';
        const shard2 = 'ac-ypgbeyh-shard-00-02.hqo48ws.mongodb.net:27017';

        const finalUri = `mongodb://swarajchaudhari:QDvWPYPtCNFZxKDc@${shard0},${shard1},${shard2}/smart_hotel?ssl=true&authSource=admin&retryWrites=true&w=majority`;

        await mongoose.connect(finalUri);
        console.log(`✅ Connected to database: ${mongoose.connection.db.databaseName}`);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        // Check if documents exist in hotels collection
        const count = await mongoose.connection.db.collection('hotels').countDocuments();
        console.log(`Found ${count} documents in 'hotels' collection.`);

        // Explicitly update all where isApproved is not true
        const result = await mongoose.connection.db.collection('hotels').updateMany({}, { $set: { isApproved: true } });
        console.log(`✅ Updated ${result.modifiedCount} hotels.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

run();

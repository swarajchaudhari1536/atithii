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
        const finalUri = `mongodb://swarajchaudhari:QDvWPYPtCNFZxKDc@${shard0}/smart_hotel?ssl=true&authSource=admin&directConnection=true`;

        await mongoose.connect(finalUri);
        console.log(`✅ Connected to database: ${mongoose.connection.db.databaseName}`);

        const hotel = await mongoose.connection.db.collection('hotels').findOne({});
        console.log('Sample Hotel Document:', JSON.stringify(hotel, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

run();

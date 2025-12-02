const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function listMountains() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Mountain = require('./models/Mountain');

    const mountains = await Mountain.find().select('name _id').sort('name');

    console.log('\n=== MOUNTAINS IN DATABASE ===');
    mountains.forEach((mountain, index) => {
      console.log(`${index + 1}. Name: "${mountain.name}", ID: ${mountain._id}`);
    });
    console.log('=============================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error listing mountains:', error);
    process.exit(1);
  }
}

listMountains();

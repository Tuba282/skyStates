const mongoose = require('mongoose');
require('dotenv').config();

async function testConn() {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri, { family: 4 });
    const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
    const p = await Property.findOne({ status: 'Approved' });
    console.log('Sample property:', JSON.stringify(p, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testConn();

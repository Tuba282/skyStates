const mongoose = require('mongoose');
require('dotenv').config();

async function checkInquiries() {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri, { family: 4 });
    const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', new mongoose.Schema({}, { strict: false }));
    const allInquiries = await Inquiry.find().lean();
    console.log('Total inquiries in DB:', allInquiries.length);
    if (allInquiries.length > 0) {
      console.log('Sample Inquiry:', JSON.stringify(allInquiries[0], null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkInquiries();

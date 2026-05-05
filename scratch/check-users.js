const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri, { family: 4 });
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const users = await User.find({}, { name: 1, email: 1, role: 1 }).lean();
    console.log('Users:', JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();

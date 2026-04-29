import dbConnect from './lib/db.js';
import User from './models/User.js';

async function checkUser() {
  await dbConnect();
  const users = await User.find({ email: 'test@skyestate.com' });
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}

checkUser();

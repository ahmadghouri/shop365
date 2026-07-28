require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const { connectDatabase } = require('../config/database');
const User = require('../modules/users/user.model');

async function resetPoints() {
  await connectDatabase();
  const result = await User.updateMany({}, { points: 0 });
  console.log(`Reset points for ${result.modifiedCount} user(s)`);
  process.exit(0);
}

resetPoints().catch((err) => {
  console.error('Failed to reset points:', err);
  process.exit(1);
});

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config({ path: './config/.env' });

async function createAdmin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_CONNECTION_URI);
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@findit.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password (same way as auth service)
    const hashedPassword = await bcrypt.hash('Admin1234', 12);

    // Create admin user
    const admin = new User({
      name: 'System Administrator',
      username: 'admin',
      email: 'admin@findit.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@findit.com');
    console.log('Password: Admin1234');
    console.log('Role: admin');

  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();

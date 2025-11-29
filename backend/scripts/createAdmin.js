import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user.js';

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      ssl: true,
      tlsAllowInvalidCertificates: true
    });
    console.log('Connected to MongoDB');

    // Get admin details from command line arguments or use defaults
    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Admin User';

    // Check if admin already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log('Admin user already exists with this email!');
        process.exit(0);
      } else {
        // Update existing user to admin
        existingUser.role = 'admin';
        const salt = await bcrypt.genSalt(10);
        existingUser.passwordHash = await bcrypt.hash(password, salt);
        existingUser.name = name;
        await existingUser.save();
        console.log('✅ Existing user updated to admin!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
      }
    }

    // Create new admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminUser = new User({
      name,
      email,
      passwordHash: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\nYou can now login with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();


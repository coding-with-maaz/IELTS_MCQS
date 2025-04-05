const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ielts-test')
  .then(() => console.log('MongoDB connected for seeding users...'))
  .catch(err => console.error('MongoDB connection error:', err));

async function seedUsers() {
  try {
    // Clear existing users
    await User.deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123!@#', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      profile: {
        testType: 'PTE',
        phoneNumber: '+1234567890',
        country: 'Australia'
      }
    });
    console.log('Admin user created');

    // Sample regular users data
    const usersData = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123!@#', 10),
        role: 'user',
        profile: {
          testType: 'PTE',
          phoneNumber: '+1234567891',
          country: 'India'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123!@#', 10),
        role: 'user',
        profile: {
          testType: 'PTE',
          phoneNumber: '+1234567892',
          country: 'UK'
        }
      },
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: await bcrypt.hash('password123!@#', 10),
        role: 'user',
        profile: {
          testType: 'PTE',
          phoneNumber: '+1234567893',
          country: 'USA'
        }
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        password: await bcrypt.hash('password123!@#', 10),
        role: 'user',
        profile: {
          testType: 'PTE',
          phoneNumber: '+1234567894',
          country: 'Canada'
        }
      }
    ];

    // Seed regular users
    await User.insertMany(usersData);
    console.log('Regular users created');

    console.log('User seeding completed successfully');
    return { admin };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

module.exports = { seedUsers }; 
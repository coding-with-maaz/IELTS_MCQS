const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    testType: 'pte'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'user123',
    role: 'user',
    testType: 'pte'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'user123',
    role: 'user',
    testType: 'pte'
  }
];

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash passwords
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );

    // Create users
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`Created ${createdUsers.length} users`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Run the seeder
seedUsers(); 
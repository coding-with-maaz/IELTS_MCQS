const mongoose = require('mongoose');
const seedPTEListeningTestData = require('./pteListeningTestSeeder');
const { seedUsers } = require('./userSeeder');
require('dotenv').config();

const connectDB = async (retries = 3) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ielts-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
      retryReads: true,
      maxPoolSize: 10
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    if (retries > 0) {
      console.log(`Connection failed. Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
      return connectDB(retries - 1);
    }
    throw error;
  }
};

const runSeeders = async () => {
  try {
    // Connect to MongoDB with retry logic
    await connectDB();

    // Run seeders in sequence
    console.log('Starting to seed data...');

    // First seed users and wait for completion
    console.log('Seeding users...');
    await seedUsers();
    console.log('Users seeded successfully');

    // Then seed PTE Listening Test data
    console.log('Seeding PTE Listening Test data...');
    await seedPTEListeningTestData();
    console.log('PTE Listening Test data seeded successfully');

    console.log('All data seeded successfully!');
    
    // Close the mongoose connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error running seeders:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seeders
runSeeders(); 
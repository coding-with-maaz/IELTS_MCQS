const mongoose = require('mongoose');
const PTESpeakingTest = require('../models/PTESpeakingTest');
const PTESpeakingSection = require('../models/PTESpeakingSection');
require('dotenv').config();

const sampleSections = [
  {
    title: 'Read Aloud',
    description: 'Read the following text aloud',
    type: 'read-aloud',
    timeLimit: 60,
    order: 1,
    totalPoints: 20,
    speakingTime: 60,
    preparationTime: 30,
    prompt: 'Read the following text clearly and naturally',
    criteria: [
      { name: 'Pronunciation', points: 8 },
      { name: 'Fluency', points: 7 },
      { name: 'Content', points: 5 }
    ],
    tasks: [
      {
        title: 'Read Aloud Task 1',
        text: 'The rapid advancement of technology has transformed the way we live and work in the modern world. From smartphones to artificial intelligence, these innovations continue to shape our daily experiences and future possibilities.',
        preparationTime: 30,
        speakingTime: 60,
        difficulty: 3,
        points: 10
      },
      {
        title: 'Read Aloud Task 2',
        text: 'Environmental conservation is crucial for maintaining the delicate balance of our ecosystem. Through sustainable practices and responsible resource management, we can ensure a better future for generations to come.',
        preparationTime: 30,
        speakingTime: 60,
        difficulty: 3,
        points: 10
      }
    ]
  },
  {
    title: 'Repeat Sentence',
    description: 'Listen and repeat the following sentences',
    type: 'repeat-sentence',
    timeLimit: 60,
    order: 2,
    totalPoints: 10,
    speakingTime: 15,
    preparationTime: 3,
    prompt: 'Listen carefully and repeat the sentence exactly as you hear it',
    criteria: [
      { name: 'Accuracy', points: 5 },
      { name: 'Pronunciation', points: 3 },
      { name: 'Fluency', points: 2 }
    ],
    tasks: [
      {
        title: 'Repeat Sentence Task 1',
        text: 'The research findings suggest a significant correlation between regular exercise and improved cognitive function.',
        preparationTime: 3,
        speakingTime: 15,
        difficulty: 2,
        points: 5
      },
      {
        title: 'Repeat Sentence Task 2',
        text: 'Global economic trends indicate a shift towards sustainable and environmentally conscious business practices.',
        preparationTime: 3,
        speakingTime: 15,
        difficulty: 2,
        points: 5
      }
    ]
  },
  {
    title: 'Describe Image',
    description: 'Describe the following image in detail',
    type: 'describe-image',
    timeLimit: 60,
    order: 3,
    totalPoints: 30,
    speakingTime: 40,
    preparationTime: 25,
    prompt: 'Describe the image in detail, focusing on key elements and trends',
    criteria: [
      { name: 'Content', points: 12 },
      { name: 'Organization', points: 8 },
      { name: 'Vocabulary', points: 5 },
      { name: 'Grammar', points: 5 }
    ],
    tasks: [
      {
        title: 'Describe Image Task 1',
        text: 'A bar chart showing global smartphone sales from 2015 to 2023',
        preparationTime: 25,
        speakingTime: 40,
        difficulty: 4,
        points: 15
      },
      {
        title: 'Describe Image Task 2',
        text: 'A line graph depicting temperature changes in major cities over the past decade',
        preparationTime: 25,
        speakingTime: 40,
        difficulty: 4,
        points: 15
      }
    ]
  },
  {
    title: 'Retell Lecture',
    description: 'Listen to the lecture and retell it in your own words',
    type: 'retell-lecture',
    timeLimit: 60,
    order: 4,
    totalPoints: 30,
    speakingTime: 40,
    preparationTime: 10,
    prompt: 'Listen to the lecture and retell the main points in your own words',
    criteria: [
      { name: 'Content', points: 12 },
      { name: 'Organization', points: 8 },
      { name: 'Vocabulary', points: 5 },
      { name: 'Grammar', points: 5 }
    ],
    tasks: [
      {
        title: 'Retell Lecture Task 1',
        text: 'A lecture about the impact of social media on modern communication',
        preparationTime: 10,
        speakingTime: 40,
        difficulty: 4,
        points: 15
      },
      {
        title: 'Retell Lecture Task 2',
        text: 'A lecture about renewable energy sources and their future potential',
        preparationTime: 10,
        speakingTime: 40,
        difficulty: 4,
        points: 15
      }
    ]
  }
];

const sampleTests = [
  {
    name: 'PTE Speaking Practice Test 1',
    description: 'A comprehensive speaking test covering all major task types',
    duration: 240,
    sections: []
  },
  {
    name: 'PTE Speaking Practice Test 2',
    description: 'Advanced speaking test with challenging tasks',
    duration: 240,
    sections: []
  }
];

const seedPTESpeakingTests = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await PTESpeakingTest.deleteMany({});
    await PTESpeakingSection.deleteMany({});
    console.log('Cleared existing PTE Speaking data');

    // Create sections
    const createdSections = await PTESpeakingSection.insertMany(sampleSections);
    console.log(`Created ${createdSections.length} sections`);

    // Create tests with sections
    const testsWithSections = sampleTests.map((test, index) => ({
      ...test,
      sections: createdSections.map((section, sectionIndex) => ({
        section: section._id,
        order: sectionIndex
      }))
    }));

    const createdTests = await PTESpeakingTest.insertMany(testsWithSections);
    console.log(`Created ${createdTests.length} tests`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding PTE Speaking tests:', error);
    process.exit(1);
  }
};

// Run the seeder
seedPTESpeakingTests();
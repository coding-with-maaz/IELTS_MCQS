const mongoose = require('mongoose');
const PTEReading = require('../models/PTEReading');
require('dotenv').config();

const samplePTEReadings = [
  {
    type: 'multiple-choice',
    title: 'Academic Reading: Climate Change Impact',
    passage: `Climate change is one of the most significant challenges facing our planet today. The increasing concentration of greenhouse gases in the atmosphere has led to rising global temperatures, melting polar ice caps, and more frequent extreme weather events. Scientists predict that if current trends continue, we could see a rise in global temperatures of up to 4°C by the end of this century, with devastating consequences for ecosystems and human societies.`,
    questions: [
      {
        question: 'What is the main cause of rising global temperatures according to the passage?',
        options: [
          'Deforestation',
          'Increasing concentration of greenhouse gases',
          'Industrial pollution',
          'Ocean acidification'
        ],
        correctAnswer: 'Increasing concentration of greenhouse gases',
        explanation: 'The passage directly states that "The increasing concentration of greenhouse gases in the atmosphere has led to rising global temperatures."'
      },
      {
        question: 'What is the predicted temperature rise by the end of this century?',
        options: [
          '2°C',
          '3°C',
          '4°C',
          '5°C'
        ],
        correctAnswer: '4°C',
        explanation: 'The passage explicitly mentions "a rise in global temperatures of up to 4°C by the end of this century."'
      }
    ],
    difficulty: 3,
    points: 2,
    timeLimit: 5,
    tags: ['climate', 'environment', 'academic']
  },
  {
    type: 'fill-in-blanks',
    title: 'Business Reading: Market Analysis',
    passage: `The global smartphone market has experienced significant growth over the past decade. In 2020, the market was valued at $500 billion, with an annual growth rate of 15%. The leading manufacturers, including Apple and Samsung, continue to innovate with new features and improved technology. However, emerging markets in Asia and Africa are becoming increasingly important for future growth.`,
    questions: [
      {
        question: 'The smartphone market was valued at $_____ billion in 2020.',
        options: ['400', '500', '600', '700'],
        correctAnswer: '500',
        explanation: 'The passage states "In 2020, the market was valued at $500 billion."'
      },
      {
        question: 'The annual growth rate was _____%.',
        options: ['10', '15', '20', '25'],
        correctAnswer: '15',
        explanation: 'The passage mentions "with an annual growth rate of 15%."'
      }
    ],
    difficulty: 2,
    points: 1,
    timeLimit: 3,
    tags: ['business', 'technology', 'market']
  },
  {
    type: 'reorder-paragraphs',
    title: 'Scientific Reading: DNA Structure',
    passage: `The discovery of DNA's double helix structure revolutionized our understanding of genetics. This breakthrough was made by James Watson and Francis Crick in 1953. The structure consists of two strands that twist around each other, forming a spiral staircase. Each strand is made up of nucleotides containing one of four bases: adenine, thymine, cytosine, or guanine. These bases pair up in a specific way: adenine with thymine, and cytosine with guanine.`,
    questions: [
      {
        question: 'Arrange the following sentences in the correct order:',
        options: [
          'The structure consists of two strands that twist around each other, forming a spiral staircase.',
          'The discovery of DNA\'s double helix structure revolutionized our understanding of genetics.',
          'These bases pair up in a specific way: adenine with thymine, and cytosine with guanine.',
          'Each strand is made up of nucleotides containing one of four bases: adenine, thymine, cytosine, or guanine.',
          'This breakthrough was made by James Watson and Francis Crick in 1953.'
        ],
        correctAnswer: ['The discovery of DNA\'s double helix structure revolutionized our understanding of genetics.', 'This breakthrough was made by James Watson and Francis Crick in 1953.', 'The structure consists of two strands that twist around each other, forming a spiral staircase.', 'Each strand is made up of nucleotides containing one of four bases: adenine, thymine, cytosine, or guanine.', 'These bases pair up in a specific way: adenine with thymine, and cytosine with guanine.'],
        explanation: 'The sentences should be arranged in chronological and logical order, starting with the discovery, followed by the discoverers, then the structure description, and finally the details about bases and their pairing.'
      }
    ],
    difficulty: 4,
    points: 3,
    timeLimit: 7,
    tags: ['science', 'biology', 'genetics']
  },
  {
    type: 'reading-writing-fill-in-blanks',
    title: 'Historical Reading: Industrial Revolution',
    passage: `The Industrial Revolution began in Britain in the late 18th century and transformed the way goods were produced. The invention of the steam engine and the development of new manufacturing processes led to increased productivity and economic growth. This period also saw significant social changes, including urbanization and the rise of the working class. The impact of these changes continues to influence modern society.`,
    questions: [
      {
        question: 'The Industrial Revolution began in _____ in the late 18th century.',
        options: ['France', 'Germany', 'Britain', 'Spain'],
        correctAnswer: 'Britain',
        explanation: 'The passage states "The Industrial Revolution began in Britain in the late 18th century."'
      },
      {
        question: 'The invention of the _____ engine led to increased productivity.',
        options: ['steam', 'electric', 'internal combustion', 'nuclear'],
        correctAnswer: 'steam',
        explanation: 'The passage mentions "The invention of the steam engine and the development of new manufacturing processes led to increased productivity."'
      }
    ],
    difficulty: 3,
    points: 2,
    timeLimit: 5,
    tags: ['history', 'industrial', 'social']
  }
];

const seedPTEReadings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await PTEReading.deleteMany({});
    console.log('Cleared existing PTE Reading data');

    // Insert new data
    const result = await PTEReading.insertMany(samplePTEReadings);
    console.log(`Successfully seeded ${result.length} PTE Reading questions`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding PTE Reading data:', error);
    process.exit(1);
  }
};

// Run the seeder
seedPTEReadings(); 
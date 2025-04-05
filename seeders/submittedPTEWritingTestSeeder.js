const mongoose = require('mongoose');
const SubmittedPTEWritingTest = require('../models/SubmittedPTEWritingTest');
const PTEWritingTest = require('../models/PTEWritingTest');
const User = require('../models/User');
require('dotenv').config();

const sampleSubmissions = [
  {
    user: null, // Will be populated with user ID
    test: null, // Will be populated with test ID
    submissions: [
      {
        section: null, // Will be populated with section ID
        answer: 'Conservation of endangered species through habitat protection, breeding programs, and public awareness is vital for maintaining biodiversity and preventing ecosystem disruption, requiring international collaboration and environmental regulations.',
        wordCount: 25,
        timeTaken: 540, // 9 minutes in seconds
        evaluation: {
          criteriaScores: [
            { name: 'contentAccuracy', score: 4, feedback: 'Good coverage of main points' },
            { name: 'grammarAndStructure', score: 5, feedback: 'Excellent grammar and structure' },
            { name: 'wordLimit', score: 2, feedback: 'Within word limit' }
          ],
          totalScore: 11,
          feedback: 'Strong summary that captures the main points while maintaining good grammar and structure.',
          gradedBy: null, // Will be populated with admin user ID
          gradedAt: new Date()
        }
      },
      {
        section: null, // Will be populated with section ID
        answer: `The integration of technology in education has revolutionized the way students learn and teachers teach. This essay examines the benefits and drawbacks of incorporating technology in modern educational settings.

One significant advantage of technology in education is increased accessibility to learning resources. Students can access educational materials, online courses, and research papers from anywhere at any time. Additionally, interactive learning platforms and multimedia content make learning more engaging and help students understand complex concepts more easily.

However, technology also presents certain challenges. Excessive screen time can lead to health issues and reduced attention spans. There's also the concern of digital distractions, where students might be tempted to browse social media or play games instead of focusing on their studies. Furthermore, the digital divide between students from different socioeconomic backgrounds can create educational inequalities.

Despite these challenges, the benefits of educational technology outweigh its drawbacks when properly implemented. The key lies in finding the right balance and establishing guidelines for technology use in educational settings. Schools should focus on digital literacy while maintaining traditional teaching methods where appropriate.

In conclusion, while technology in education offers numerous advantages in terms of accessibility and engagement, it's crucial to address its challenges through proper implementation and guidelines. A balanced approach that combines technological innovation with traditional teaching methods will likely yield the best educational outcomes.`,
        wordCount: 280,
        timeTaken: 1080, // 18 minutes in seconds
        evaluation: {
          criteriaScores: [
            { name: 'contentDevelopment', score: 5, feedback: 'Well-developed ideas with strong examples' },
            { name: 'organization', score: 4, feedback: 'Clear structure but could be more cohesive' },
            { name: 'grammarAndVocabulary', score: 5, feedback: 'Excellent use of language' },
            { name: 'wordLimit', score: 3, feedback: 'Within word limit' }
          ],
          totalScore: 17,
          feedback: 'Strong essay with good development of ideas and excellent language use.',
          gradedBy: null, // Will be populated with admin user ID
          gradedAt: new Date()
        }
      }
    ],
    totalScore: 28,
    maxScore: 30,
    percentage: 93.33,
    timeTaken: 1620, // 27 minutes in seconds
    completedAt: new Date(),
    status: 'graded'
  },
  {
    user: null, // Will be populated with user ID
    test: null, // Will be populated with test ID
    submissions: [
      {
        section: null, // Will be populated with section ID
        answer: 'While AI is revolutionizing multiple industries by enhancing efficiency and creating opportunities, it simultaneously presents challenges regarding employment and ethics that need to be carefully addressed.',
        wordCount: 20,
        timeTaken: 480, // 8 minutes in seconds
        evaluation: {
          criteriaScores: [
            { name: 'contentAccuracy', score: 5, feedback: 'Excellent coverage of main points' },
            { name: 'grammarAndStructure', score: 4, feedback: 'Good grammar with minor issues' },
            { name: 'wordLimit', score: 2, feedback: 'Within word limit' }
          ],
          totalScore: 11,
          feedback: 'Strong summary that effectively captures the main points.',
          gradedBy: null, // Will be populated with admin user ID
          gradedAt: new Date()
        }
      },
      {
        section: null, // Will be populated with section ID
        answer: `The COVID-19 pandemic has accelerated the adoption of remote work across industries, fundamentally changing workplace dynamics. This essay explores how remote work has impacted organizational culture and employee productivity.

Remote work has brought several advantages to both employers and employees. Companies have reduced operational costs associated with maintaining physical offices, while workers have eliminated commuting time and gained flexibility in managing their work-life balance. Many organizations report maintained or improved productivity levels as employees work in comfortable environments with fewer office distractions.

However, remote work also presents significant challenges. The lack of face-to-face interaction can lead to feelings of isolation and reduced team cohesion. Communication may become more complicated, with the potential for misunderstandings in virtual meetings and email exchanges. Additionally, some employees struggle with maintaining boundaries between work and personal life when working from home.

Organizations have adapted by implementing new technologies and practices to maintain company culture virtually. Regular video conferences, virtual team-building activities, and digital collaboration tools help bridge the physical gap. Some companies have adopted hybrid models, combining remote work with occasional office presence to balance the benefits of both approaches.

In conclusion, while remote work offers notable benefits in terms of flexibility and cost savings, organizations must actively address its challenges to maintain a healthy workplace culture. Success in the remote work era requires a thoughtful approach to communication, team building, and work-life balance.`,
        wordCount: 290,
        timeTaken: 1020, // 17 minutes in seconds
        evaluation: {
          criteriaScores: [
            { name: 'contentDevelopment', score: 4, feedback: 'Good development of ideas' },
            { name: 'organization', score: 5, feedback: 'Excellent structure' },
            { name: 'grammarAndVocabulary', score: 4, feedback: 'Good language use' },
            { name: 'wordLimit', score: 3, feedback: 'Within word limit' }
          ],
          totalScore: 16,
          feedback: 'Well-structured essay with good development of ideas.',
          gradedBy: null, // Will be populated with admin user ID
          gradedAt: new Date()
        }
      }
    ],
    totalScore: 27,
    maxScore: 30,
    percentage: 90,
    timeTaken: 1500, // 25 minutes in seconds
    completedAt: new Date(),
    status: 'graded'
  }
];

const seedSubmittedPTEWritingTests = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await SubmittedPTEWritingTest.deleteMany({});
    console.log('Cleared existing submitted PTE Writing tests');

    // Get test and user IDs
    const test = await PTEWritingTest.findOne();
    const users = await User.find({ role: 'user' }).limit(2);
    const admin = await User.findOne({ role: 'admin' });

    if (!test || users.length < 2 || !admin) {
      throw new Error('Required data not found. Please run other seeders first.');
    }

    // Create submissions
    const submissions = sampleSubmissions.map((submission, index) => {
      const user = users[index % users.length];
      const testSections = test.sections;
      
      return {
        ...submission,
        user: user._id,
        test: test._id,
        submissions: submission.submissions.map((sub, idx) => ({
          ...sub,
          section: testSections[idx].section,
          evaluation: {
            ...sub.evaluation,
            gradedBy: admin._id
          }
        }))
      };
    });

    const createdSubmissions = await SubmittedPTEWritingTest.insertMany(submissions);
    console.log(`Created ${createdSubmissions.length} submitted tests`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding submitted PTE Writing tests:', error);
    process.exit(1);
  }
};

// Run the seeder
seedSubmittedPTEWritingTests(); 
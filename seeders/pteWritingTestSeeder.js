const mongoose = require('mongoose');
const PTEWritingTest = require('../models/PTEWritingTest');
const PTEWritingSection = require('../models/PTEWritingSection');
require('dotenv').config();

const sampleSections = [
  {
    title: 'Summarize Written Text - Environmental Conservation',
    description: 'Read and summarize the following text about environmental conservation.',
    type: 'summarize-written-text',
    prompt: `The conservation of endangered species is crucial for maintaining biodiversity and ecological balance. Many species are facing extinction due to habitat loss, climate change, and human activities. Conservation efforts involve protecting natural habitats, implementing breeding programs, and raising public awareness. Scientists emphasize that the loss of any species can have far-reaching consequences for entire ecosystems. International cooperation and strict environmental regulations are essential for successful conservation programs.`,
    wordLimit: 75,
    timeLimit: 10,
    totalPoints: 12,
    criteria: [
      { name: 'contentAccuracy', points: 5 },
      { name: 'grammarAndStructure', points: 5 },
      { name: 'wordLimit', points: 2 }
    ],
    sampleAnswer: 'Conservation of endangered species through habitat protection, breeding programs, and public awareness is vital for maintaining biodiversity and preventing ecosystem disruption, requiring international collaboration and environmental regulations.'
  },
  {
    title: 'Write Essay - Technology in Education',
    description: 'Write an essay discussing the impact of technology in modern education.',
    type: 'write-essay',
    prompt: 'Discuss the advantages and disadvantages of using technology in modern education. Provide specific examples to support your arguments.',
    wordLimit: 300,
    timeLimit: 20,
    totalPoints: 18,
    criteria: [
      { name: 'contentDevelopment', points: 5 },
      { name: 'organization', points: 5 },
      { name: 'grammarAndVocabulary', points: 5 },
      { name: 'wordLimit', points: 3 }
    ],
    sampleAnswer: `The integration of technology in education has revolutionized the way students learn and teachers teach. This essay examines the benefits and drawbacks of incorporating technology in modern educational settings.

One significant advantage of technology in education is increased accessibility to learning resources. Students can access educational materials, online courses, and research papers from anywhere at any time. Additionally, interactive learning platforms and multimedia content make learning more engaging and help students understand complex concepts more easily.

However, technology also presents certain challenges. Excessive screen time can lead to health issues and reduced attention spans. There's also the concern of digital distractions, where students might be tempted to browse social media or play games instead of focusing on their studies. Furthermore, the digital divide between students from different socioeconomic backgrounds can create educational inequalities.

Despite these challenges, the benefits of educational technology outweigh its drawbacks when properly implemented. The key lies in finding the right balance and establishing guidelines for technology use in educational settings. Schools should focus on digital literacy while maintaining traditional teaching methods where appropriate.

In conclusion, while technology in education offers numerous advantages in terms of accessibility and engagement, it's crucial to address its challenges through proper implementation and guidelines. A balanced approach that combines technological innovation with traditional teaching methods will likely yield the best educational outcomes.`
  },
  {
    title: 'Summarize Written Text - AI Impact',
    description: 'Read and summarize the following text about artificial intelligence.',
    type: 'summarize-written-text',
    prompt: `Artificial Intelligence (AI) is transforming various sectors of the global economy. From healthcare and finance to transportation and manufacturing, AI technologies are automating processes, improving efficiency, and creating new opportunities. However, this transformation also raises concerns about job displacement and ethical considerations. The key challenge lies in harnessing AI's potential while addressing its societal implications.`,
    wordLimit: 75,
    timeLimit: 10,
    totalPoints: 12,
    criteria: [
      { name: 'contentAccuracy', points: 5 },
      { name: 'grammarAndStructure', points: 5 },
      { name: 'wordLimit', points: 2 }
    ],
    sampleAnswer: 'While AI is revolutionizing multiple industries by enhancing efficiency and creating opportunities, it simultaneously presents challenges regarding employment and ethics that need to be carefully addressed.'
  },
  {
    title: 'Write Essay - Remote Work Culture',
    description: 'Write an essay about the impact of remote work on workplace culture.',
    type: 'write-essay',
    prompt: 'How has the rise of remote work affected workplace culture and productivity? Discuss the benefits and challenges of remote working arrangements.',
    wordLimit: 300,
    timeLimit: 20,
    totalPoints: 18,
    criteria: [
      { name: 'contentDevelopment', points: 5 },
      { name: 'organization', points: 5 },
      { name: 'grammarAndVocabulary', points: 5 },
      { name: 'wordLimit', points: 3 }
    ],
    sampleAnswer: `The COVID-19 pandemic has accelerated the adoption of remote work across industries, fundamentally changing workplace dynamics. This essay explores how remote work has impacted organizational culture and employee productivity.

Remote work has brought several advantages to both employers and employees. Companies have reduced operational costs associated with maintaining physical offices, while workers have eliminated commuting time and gained flexibility in managing their work-life balance. Many organizations report maintained or improved productivity levels as employees work in comfortable environments with fewer office distractions.

However, remote work also presents significant challenges. The lack of face-to-face interaction can lead to feelings of isolation and reduced team cohesion. Communication may become more complicated, with the potential for misunderstandings in virtual meetings and email exchanges. Additionally, some employees struggle with maintaining boundaries between work and personal life when working from home.

Organizations have adapted by implementing new technologies and practices to maintain company culture virtually. Regular video conferences, virtual team-building activities, and digital collaboration tools help bridge the physical gap. Some companies have adopted hybrid models, combining remote work with occasional office presence to balance the benefits of both approaches.

In conclusion, while remote work offers notable benefits in terms of flexibility and cost savings, organizations must actively address its challenges to maintain a healthy workplace culture. Success in the remote work era requires a thoughtful approach to communication, team building, and work-life balance.`
  }
];

const sampleTests = [
  {
    name: 'PTE Writing Practice Test 1',
    description: 'A comprehensive writing test covering both summarize written text and essay writing tasks.',
    duration: 60,
    sections: [] // Will be populated after creating sections
  },
  {
    name: 'PTE Writing Practice Test 2',
    description: 'Advanced writing test focusing on complex topics and detailed analysis.',
    duration: 60,
    sections: [] // Will be populated after creating sections
  }
];

const seedPTEWritingTests = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await PTEWritingSection.deleteMany({});
    await PTEWritingTest.deleteMany({});
    console.log('Cleared existing PTE Writing data');

    // Create sections
    const createdSections = await PTEWritingSection.insertMany(sampleSections);
    console.log(`Created ${createdSections.length} sections`);

    // Create tests with sections
    const tests = sampleTests.map((test, index) => {
      const startIdx = index * 2;
      return {
        ...test,
        sections: createdSections.slice(startIdx, startIdx + 2).map((section, order) => ({
          section: section._id,
          order
        }))
      };
    });

    const createdTests = await PTEWritingTest.insertMany(tests);
    console.log(`Created ${createdTests.length} tests`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding PTE Writing data:', error);
    process.exit(1);
  }
};

// Run the seeder
seedPTEWritingTests(); 
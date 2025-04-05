const User = require('../models/User');
const ListeningTest = require('../models/ListeningTest');
const ReadingTest = require('../models/ReadingTest');
const WritingTest = require('../models/WritingTest');
const SpeakingTest = require('../models/SpeakingTest');
const PTEWritingTest = require('../models/PTEWritingTest');
const PTESpeakingTest = require('../models/PTESpeakingTest');
const PTEReadingTest = require('../models/PTEReadingTest');
const PTEListeningTest = require('../models/PTEListeningTest');
const SubmittedListeningTest = require('../models/SubmittedListeningTest');
const SubmittedReadingTest = require('../models/SubmittedReadingTest');
const SubmittedWritingTest = require('../models/SubmittedWritingTest');
const SubmittedSpeakingTest = require('../models/SubmittedSpeakingTest');
const SubmittedPTEWritingTest = require('../models/SubmittedPTEWritingTest');
const SubmittedPTESpeakingTest = require('../models/SubmittedPTESpeakingTest');
const SubmittedPTEReadingTest = require('../models/SubmittedPTEReadingTest');
const SubmittedPTEListeningTest = require('../models/SubmittedPTEListeningTest');

const getDashboardStats = async (req, res) => {
  try {
    // Get total tests
    const [
      listeningTests, 
      readingTests, 
      writingTests, 
      speakingTests,
      pteListeningTests,
      pteReadingTests,
      pteWritingTests,
      pteSpeakingTests
    ] = await Promise.all([
      ListeningTest.countDocuments(),
      ReadingTest.countDocuments(),
      WritingTest.countDocuments(),
      SpeakingTest.countDocuments(),
      PTEListeningTest.countDocuments(),
      PTEReadingTest.countDocuments(),
      PTEWritingTest.countDocuments(),
      PTESpeakingTest.countDocuments()
    ]);

    // Get total submissions
    const [
      listeningSubmissions, 
      readingSubmissions, 
      writingSubmissions, 
      speakingSubmissions,
      pteListeningSubmissions,
      pteReadingSubmissions,
      pteWritingSubmissions,
      pteSpeakingSubmissions
    ] = await Promise.all([
      SubmittedListeningTest.countDocuments(),
      SubmittedReadingTest.countDocuments(),
      SubmittedWritingTest.countDocuments(),
      SubmittedSpeakingTest.countDocuments(),
      SubmittedPTEListeningTest.countDocuments(),
      SubmittedPTEReadingTest.countDocuments(),
      SubmittedPTEWritingTest.countDocuments(),
      SubmittedPTESpeakingTest.countDocuments()
    ]);

    // Get pending grading
    const [
      pendingListening, 
      pendingReading, 
      pendingWriting, 
      pendingSpeaking,
      pendingPTEListening,
      pendingPTEReading,
      pendingPTEWriting,
      pendingPTESpeaking
    ] = await Promise.all([
      SubmittedListeningTest.countDocuments({ status: 'pending' }),
      SubmittedReadingTest.countDocuments({ status: 'pending' }),
      SubmittedWritingTest.countDocuments({ status: 'pending' }),
      SubmittedSpeakingTest.countDocuments({ status: 'pending' }),
      SubmittedPTEListeningTest.countDocuments({ status: 'pending' }),
      SubmittedPTEReadingTest.countDocuments({ status: 'pending' }),
      SubmittedPTEWritingTest.countDocuments({ status: 'pending' }),
      SubmittedPTESpeakingTest.countDocuments({ status: 'pending' })
    ]);

    // Get active users (users who have submitted at least one test)
    const activeUsers = await User.countDocuments({
      $or: [
        { 'submissions.listening': { $exists: true, $ne: [] } },
        { 'submissions.reading': { $exists: true, $ne: [] } },
        { 'submissions.writing': { $exists: true, $ne: [] } },
        { 'submissions.speaking': { $exists: true, $ne: [] } },
        { 'submissions.pteListening': { $exists: true, $ne: [] } },
        { 'submissions.pteReading': { $exists: true, $ne: [] } },
        { 'submissions.pteWriting': { $exists: true, $ne: [] } },
        { 'submissions.pteSpeaking': { $exists: true, $ne: [] } }
      ]
    });

    // Calculate average scores
    const [
      avgListening, 
      avgReading, 
      avgWriting, 
      avgSpeaking,
      avgPTEListening,
      avgPTEReading,
      avgPTEWriting,
      avgPTESpeaking
    ] = await Promise.all([
      SubmittedListeningTest.aggregate([
        { $match: { status: 'graded' } },
        { $group: { _id: null, avg: { $avg: '$grade' } } }
      ]),
      SubmittedReadingTest.aggregate([
        { $match: { status: 'graded' } },
        { $group: { _id: null, avg: { $avg: '$grade' } } }
      ]),
      SubmittedWritingTest.aggregate([
        { $match: { status: 'graded' } },
        { $group: { _id: null, avg: { $avg: '$overallBandScore' } } }
      ]),
      SubmittedSpeakingTest.aggregate([
        { $match: { status: 'graded' } },
        { $group: { _id: null, avg: { $avg: '$overallBandScore' } } }
      ]),
      SubmittedPTEListeningTest.aggregate([
        { $match: { status: 'graded' } },
        { $group: { _id: null, avg: { $avg: '$totalScore' } } }
      ]),
      SubmittedPTEReadingTest.aggregate([
        { $match: { status: 'graded' } },
        { $group: { _id: null, avg: { $avg: '$totalScore' } } }
      ]),
      SubmittedPTEWritingTest.aggregate([
        { $match: { status: 'graded' } },
        { $group: { _id: null, avg: { $avg: '$totalScore' } } }
      ]),
      SubmittedPTESpeakingTest.aggregate([
        { $match: { status: 'graded' } },
        { $group: { _id: null, avg: { $avg: '$totalScore' } } }
      ])
    ]);

    // Calculate completion rates
    const [
      completionListening, 
      completionReading, 
      completionWriting, 
      completionSpeaking,
      completionPTEListening,
      completionPTEReading,
      completionPTEWriting,
      completionPTESpeaking
    ] = await Promise.all([
      SubmittedListeningTest.aggregate([
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $group: { _id: null, avg: { $avg: '$count' } } }
      ]),
      SubmittedReadingTest.aggregate([
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $group: { _id: null, avg: { $avg: '$count' } } }
      ]),
      SubmittedWritingTest.aggregate([
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $group: { _id: null, avg: { $avg: '$count' } } }
      ]),
      SubmittedSpeakingTest.aggregate([
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $group: { _id: null, avg: { $avg: '$count' } } }
      ]),
      SubmittedPTEListeningTest.aggregate([
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $group: { _id: null, avg: { $avg: '$count' } } }
      ]),
      SubmittedPTEReadingTest.aggregate([
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $group: { _id: null, avg: { $avg: '$count' } } }
      ]),
      SubmittedPTEWritingTest.aggregate([
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $group: { _id: null, avg: { $avg: '$count' } } }
      ]),
      SubmittedPTESpeakingTest.aggregate([
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $group: { _id: null, avg: { $avg: '$count' } } }
      ])
    ]);

    res.json({
      totalTests: {
        listening: listeningTests,
        reading: readingTests,
        writing: writingTests,
        speaking: speakingTests,
        pteListening: pteListeningTests,
        pteReading: pteReadingTests,
        pteWriting: pteWritingTests,
        pteSpeaking: pteSpeakingTests
      },
      totalSubmissions: {
        listening: listeningSubmissions,
        reading: readingSubmissions,
        writing: writingSubmissions,
        speaking: speakingSubmissions,
        pteListening: pteListeningSubmissions,
        pteReading: pteReadingSubmissions,
        pteWriting: pteWritingSubmissions,
        pteSpeaking: pteSpeakingSubmissions
      },
      pendingGrading: {
        listening: pendingListening,
        reading: pendingReading,
        writing: pendingWriting,
        speaking: pendingSpeaking,
        pteListening: pendingPTEListening,
        pteReading: pendingPTEReading,
        pteWriting: pendingPTEWriting,
        pteSpeaking: pendingPTESpeaking
      },
      activeUsers,
      averageScore: {
        listening: avgListening[0]?.avg || 0,
        reading: avgReading[0]?.avg || 0,
        writing: avgWriting[0]?.avg || 0,
        speaking: avgSpeaking[0]?.avg || 0,
        pteListening: avgPTEListening[0]?.avg || 0,
        pteReading: avgPTEReading[0]?.avg || 0,
        pteWriting: avgPTEWriting[0]?.avg || 0,
        pteSpeaking: avgPTESpeaking[0]?.avg || 0
      },
      completionRate: {
        listening: completionListening[0]?.avg || 0,
        reading: completionReading[0]?.avg || 0,
        writing: completionWriting[0]?.avg || 0,
        speaking: completionSpeaking[0]?.avg || 0,
        pteListening: completionPTEListening[0]?.avg || 0,
        pteReading: completionPTEReading[0]?.avg || 0,
        pteWriting: completionPTEWriting[0]?.avg || 0,
        pteSpeaking: completionPTESpeaking[0]?.avg || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    // Get recent submissions
    const [
      listeningSubmissions, 
      readingSubmissions, 
      writingSubmissions, 
      speakingSubmissions,
      pteListeningSubmissions,
      pteReadingSubmissions,
      pteWritingSubmissions,
      pteSpeakingSubmissions
    ] = await Promise.all([
      SubmittedListeningTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'title'),
      SubmittedReadingTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'testName'),
      SubmittedWritingTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'testName'),
      SubmittedSpeakingTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'testName'),
      SubmittedPTEListeningTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'title'),
      SubmittedPTEReadingTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'title'),
      SubmittedPTEWritingTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'title'),
      SubmittedPTESpeakingTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'title')
    ]);

    // Format activities
    const activities = [
      ...listeningSubmissions.map(sub => ({
        id: sub._id,
        type: 'submission',
        user: sub.user?.name || 'Unknown User',
        action: 'submitted',
        target: sub.test?.title || 'Unknown Test',
        timestamp: sub.submittedAt,
        testType: 'listening'
      })),
      ...readingSubmissions.map(sub => ({
        id: sub._id,
        type: 'submission',
        user: sub.user?.name || 'Unknown User',
        action: 'submitted',
        target: sub.test?.testName || 'Unknown Test',
        timestamp: sub.submittedAt,
        testType: 'reading'
      })),
      ...writingSubmissions.map(sub => ({
        id: sub._id,
        type: 'submission',
        user: sub.user?.name || 'Unknown User',
        action: 'submitted',
        target: sub.test?.testName || 'Unknown Test',
        timestamp: sub.submittedAt,
        testType: 'writing'
      })),
      ...speakingSubmissions.map(sub => ({
        id: sub._id,
        type: 'submission',
        user: sub.user?.name || 'Unknown User',
        action: 'submitted',
        target: sub.test?.testName || 'Unknown Test',
        timestamp: sub.submittedAt,
        testType: 'speaking'
      })),
      ...pteListeningSubmissions.map(sub => ({
        id: sub._id,
        type: 'submission',
        user: sub.user?.name || 'Unknown User',
        action: 'submitted',
        target: sub.test?.title || 'Unknown Test',
        timestamp: sub.submittedAt,
        testType: 'pteListening'
      })),
      ...pteReadingSubmissions.map(sub => ({
        id: sub._id,
        type: 'submission',
        user: sub.user?.name || 'Unknown User',
        action: 'submitted',
        target: sub.test?.title || 'Unknown Test',
        timestamp: sub.submittedAt,
        testType: 'pteReading'
      })),
      ...pteWritingSubmissions.map(sub => ({
        id: sub._id,
        type: 'submission',
        user: sub.user?.name || 'Unknown User',
        action: 'submitted',
        target: sub.test?.title || 'Unknown Test',
        timestamp: sub.submittedAt,
        testType: 'pteWriting'
      })),
      ...pteSpeakingSubmissions.map(sub => ({
        id: sub._id,
        type: 'submission',
        user: sub.user?.name || 'Unknown User',
        action: 'submitted',
        target: sub.test?.title || 'Unknown Test',
        timestamp: sub.submittedAt,
        testType: 'pteSpeaking'
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Error fetching recent activity' });
  }
};

const getRecentSubmissions = async (req, res) => {
  try {
    // Get recent submissions from all test types
    const [
      listeningSubmissions, 
      readingSubmissions, 
      writingSubmissions, 
      speakingSubmissions,
      pteListeningSubmissions,
      pteReadingSubmissions,
      pteWritingSubmissions,
      pteSpeakingSubmissions
    ] = await Promise.all([
      SubmittedListeningTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'title'),
      SubmittedReadingTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'testName'),
      SubmittedWritingTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'testName'),
      SubmittedSpeakingTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'testName'),
      SubmittedPTEListeningTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'title'),
      SubmittedPTEReadingTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'title'),
      SubmittedPTEWritingTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'title'),
      SubmittedPTESpeakingTest.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('test', 'title')
    ]);

    // Format submissions
    const submissions = [
      ...listeningSubmissions.map(sub => ({
        id: sub._id,
        userName: sub.user?.name || 'Unknown User',
        testName: sub.test?.title || 'Unknown Test',
        testType: 'listening',
        testCategory: 'ielts',
        submittedAt: sub.submittedAt,
        status: sub.status,
        grade: sub.grade
      })),
      ...readingSubmissions.map(sub => ({
        id: sub._id,
        userName: sub.user?.name || 'Unknown User',
        testName: sub.test?.testName || 'Unknown Test',
        testType: 'reading',
        testCategory: 'ielts',
        submittedAt: sub.submittedAt,
        status: sub.status,
        grade: sub.grade
      })),
      ...writingSubmissions.map(sub => ({
        id: sub._id,
        userName: sub.user?.name || 'Unknown User',
        testName: sub.test?.testName || 'Unknown Test',
        testType: 'writing',
        testCategory: 'ielts',
        submittedAt: sub.submittedAt,
        status: sub.status,
        grade: sub.overallBandScore
      })),
      ...speakingSubmissions.map(sub => ({
        id: sub._id,
        userName: sub.user?.name || 'Unknown User',
        testName: sub.test?.testName || 'Unknown Test',
        testType: 'speaking',
        testCategory: 'ielts',
        submittedAt: sub.submittedAt,
        status: sub.status,
        grade: sub.overallBandScore
      })),
      ...pteListeningSubmissions.map(sub => ({
        id: sub._id,
        userName: sub.user?.name || 'Unknown User',
        testName: sub.test?.title || 'Unknown Test',
        testType: 'listening',
        testCategory: 'pte',
        submittedAt: sub.submittedAt,
        status: sub.status,
        grade: sub.totalScore
      })),
      ...pteReadingSubmissions.map(sub => ({
        id: sub._id,
        userName: sub.user?.name || 'Unknown User',
        testName: sub.test?.title || 'Unknown Test',
        testType: 'reading',
        testCategory: 'pte',
        submittedAt: sub.submittedAt,
        status: sub.status,
        grade: sub.totalScore
      })),
      ...pteWritingSubmissions.map(sub => ({
        id: sub._id,
        userName: sub.user?.name || 'Unknown User',
        testName: sub.test?.title || 'Unknown Test',
        testType: 'writing',
        testCategory: 'pte',
        submittedAt: sub.submittedAt,
        status: sub.status,
        grade: sub.totalScore
      })),
      ...pteSpeakingSubmissions.map(sub => ({
        id: sub._id,
        userName: sub.user?.name || 'Unknown User',
        testName: sub.test?.title || 'Unknown Test',
        testType: 'speaking',
        testCategory: 'pte',
        submittedAt: sub.submittedAt,
        status: sub.status,
        grade: sub.totalScore
      }))
    ].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5);

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching recent submissions:', error);
    res.status(500).json({ message: 'Error fetching recent submissions' });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getRecentSubmissions
}; 
const submittedReadingTestRoutes = require('./routes/submittedReadingTestRoutes');
const submittedWritingTestRoutes = require('./routes/submittedWritingTestRoutes');

// Import routes
const authRoutes = require('./routes/authRoutes');
const readingTestRoutes = require('./routes/readingTestRoutes');
const readingSectionRoutes = require('./routes/readingSectionRoutes');
const questionRoutes = require('./routes/questionRoutes');
const listeningTestRoutes = require('./routes/listeningTestRoutes');
const readingQuestionRoutes = require('./routes/readingQuestionRoutes');
const speakingTestRoutes = require('./routes/speakingTestRoutes');
const speakingSectionRoutes = require('./routes/speakingSectionRoutes');
const writingTestRoutes = require('./routes/writingTestRoutes');
const writingSectionRoutes = require('./routes/writingSectionRoutes');
const submittedSpeakingTestRoutes = require('./routes/submittedSpeakingTestRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const pteReadingRoutes = require('./routes/pteReadingRoutes');
const pteReadingTestRoutes = require('./routes/pteReadingTestRoutes');
const submittedPTEReadingRoutes = require('./routes/submittedPTEReadingRoutes');
const pteWritingTestRoutes = require('./routes/pteWritingTestRoutes');
const submittedPTEWritingRoutes = require('./routes/submittedPTEWritingRoutes');
const pteListeningQuestionRoutes = require('./routes/pteListeningQuestionRoutes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/listening-tests', listeningTestRoutes);
app.use('/api/reading-sections', readingSectionRoutes);
app.use('/api/reading-questions', readingQuestionRoutes);
app.use('/api/reading-tests', readingTestRoutes);
app.use('/api/speaking-tests', speakingTestRoutes);
app.use('/api/speaking-sections', speakingSectionRoutes);
app.use('/api/writing-sections', writingSectionRoutes);
app.use('/api/writing-questions', writingQuestionRoutes);
app.use('/api/writing-tests', writingTestRoutes);
app.use('/api/submitted-reading-tests', submittedReadingTestRoutes);
app.use('/api/submitted-writing-tests', submittedWritingTestRoutes);
app.use('/api/submitted-speaking-tests', submittedSpeakingTestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/v1/pte-reading', pteReadingRoutes);
app.use('/api/v1/pte-reading-tests', pteReadingTestRoutes);
app.use('/api/v1/submitted-pte-reading', submittedPTEReadingRoutes);
app.use('/api/v1/pte-writing-tests', pteWritingTestRoutes);
app.use('/api/v1/submitted-pte-writing', submittedPTEWritingRoutes);
app.use('/api/pte-listening-questions', pteListeningQuestionRoutes); 
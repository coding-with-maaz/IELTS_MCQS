const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const {
  errorHandler,
  handleValidationError,
  handleDuplicateFieldsDB,
  handleCastErrorDB,
  handleJWTError,
  handleJWTExpiredError
} = require('./utils/errorHandler');
require('dotenv').config();

const questionRoutes = require('./routes/questionRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const testRoutes = require('./routes/listeningTestRoutes');
const readingQuestionRoutes = require('./routes/readingQuestionRoutes');
const readingSectionRoutes = require('./routes/readingSectionRoutes');
const readingTestRoutes = require('./routes/readingTestRoutes');
const speakingSectionRoutes = require('./routes/speakingSectionRoutes');
const speakingTestRoutes = require('./routes/speakingTestRoutes');
const writingSectionRoutes = require('./routes/writingSectionRoutes');
const writingTestRoutes = require('./routes/writingTestRoutes');
const writingQuestionRoutes = require('./routes/writingQuestionRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const submittedListeningTestRoutes = require('./routes/submittedListeningTestRoutes');
const submittedReadingTestRoutes = require('./routes/submittedReadingTestRoutes');
const submittedWritingTestRoutes = require('./routes/submittedWritingTestRoutes');
const submittedSpeakingTestRoutes = require('./routes/submittedSpeakingTestRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const pteReadingRoutes = require('./routes/pteReadingRoutes');
const pteReadingTestRoutes = require('./routes/pteReadingTestRoutes');
const submittedPTEReadingRoutes = require('./routes/submittedPTEReadingRoutes');
const pteWritingTestRoutes = require('./routes/pteWritingTestRoutes');
const submittedPTEWritingRoutes = require('./routes/submittedPTEWritingRoutes');
const pteSpeakingTestRoutes = require('./routes/pteSpeakingTestRoutes');
const submittedPTESpeakingTestRoutes = require('./routes/submittedPTESpeakingTestRoutes');
const pteListeningQuestionRoutes = require('./routes/pteListeningQuestionRoutes');


const app = express();

// CORS Configuration
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8080',
      'https://ielts-dashboard.vercel.app',
      'https://ielts-backend-sigma.vercel.app',
      'http://localhost:5173', // Vite's default port
      'http://127.0.0.1:5173',  // Vite's default localhost
      'http://frontend.abspak.com', // Production frontend
      'https://frontend.abspak.com' // Production frontend with HTTPS
    ];
    
    if (!origin) return callback(null, true); // Allow no origin (mobile apps, etc.)
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'x-test-type', 'Accept', 'Range', 'Accept-Ranges', 'Content-Range'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Type', 'Authorization', 'x-auth-token', 'x-test-type'],
  credentials: true, // Important for sending cookies
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware before other middleware
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve static files from the uploads directory with CORS
app.use('/uploads', (req, res, next) => {
  // Set CORS headers
  const origin = req.headers.origin;
  if (corsOptions.origin && typeof corsOptions.origin === 'function') {
    corsOptions.origin(origin, (err, allowed) => {
      if (allowed) {
        res.set({
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth-token, x-test-type, Accept, Range, Accept-Ranges, Content-Range',
          'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length, Content-Type, Authorization, x-auth-token, x-test-type',
          'Access-Control-Allow-Credentials': 'true'
        });
      }
    });
  }

  // Set proper MIME types for audio files
  if (req.path.endsWith('.webm')) {
    res.set('Content-Type', 'audio/webm');
  } else if (req.path.endsWith('.mp3')) {
    res.set('Content-Type', 'audio/mpeg');
  } else if (req.path.endsWith('.wav')) {
    res.set('Content-Type', 'audio/wav');
  }

  // Handle range requests for audio streaming
  if (req.headers.range) {
    const file = path.join(__dirname, 'uploads', req.path);
    const stat = fs.statSync(file);
    const range = req.headers.range;
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = (end - start) + 1;

    res.set({
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize
    });
    res.status(206);

    const stream = fs.createReadStream(file, { start, end });
    stream.pipe(res);
  } else {
    next();
  }
}, express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.webm')) {
      res.set('Content-Type', 'audio/webm');
    }
  }
}));

// MongoDB Connection with improved error handling and options
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if we can't connect to the database
});

// Routes with /api prefix
app.use('/api/questions', questionRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/reading-questions', readingQuestionRoutes);
app.use('/api/reading-sections', readingSectionRoutes);
app.use('/api/reading-tests', readingTestRoutes);
app.use('/api/speaking-sections', speakingSectionRoutes);
app.use('/api/speaking-tests', speakingTestRoutes);
app.use('/api/writing-questions', writingQuestionRoutes);
app.use('/api/writing-sections', writingSectionRoutes);
app.use('/api/writing-tests', writingTestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/submitted-listening-tests', submittedListeningTestRoutes);
app.use('/api/submitted-reading-tests', submittedReadingTestRoutes);
app.use('/api/submitted-writing-tests', submittedWritingTestRoutes);
app.use('/api/submitted-speaking-tests', submittedSpeakingTestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pte-reading', pteReadingRoutes);
app.use('/api/pte-reading-tests', pteReadingTestRoutes);
app.use('/api/submitted-pte-reading-tests', submittedPTEReadingRoutes);
app.use('/api/pte-writing', pteWritingTestRoutes);
app.use('/api/submitted-pte-writing-tests', submittedPTEWritingRoutes);
app.use('/api/pte-speaking', pteSpeakingTestRoutes);
app.use('/api/submitted-pte-speaking-tests', submittedPTESpeakingTestRoutes);
app.use('/api/pte-listening-questions', pteListeningQuestionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    err = handleValidationError(err);
  } else if (err.code === 11000) {
    err = handleDuplicateFieldsDB(err);
  } else if (err.name === 'CastError') {
    err = handleCastErrorDB(err);
  } else if (err.name === 'JsonWebTokenError') {
    err = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    err = handleJWTExpiredError();
  }
  errorHandler(err, req, res, next);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const pteListeningQuestionRoutes = require('./routes/pteListeningQuestionRoutes');
// ... other route imports ...

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pte-listening-questions', pteListeningQuestionRoutes);
// ... other route mounting ... 
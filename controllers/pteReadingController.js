const PTEReading = require('../models/PTEReading');
const catchAsync = require('../utils/errorHandler').catchAsync;
const AppError = require('../utils/errorHandler').AppError;

// Create a new PTE Reading question
exports.createPTEReading = catchAsync(async (req, res, next) => {
  const newPTEReading = await PTEReading.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      pteReading: newPTEReading
    }
  });
});

// Get all PTE Reading questions
exports.getAllPTEReadings = catchAsync(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build query
  const query = {};
  if (req.query.difficulty) query.difficulty = req.query.difficulty;
  if (req.query.type) query.type = req.query.type;
  if (req.query.tags) query.tags = { $in: req.query.tags.split(',') };

  // Execute query with pagination
  const pteReadings = await PTEReading.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Get total count for pagination
  const total = await PTEReading.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: pteReadings.length,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalResults: total
    },
    data: {
      pteReadings
    }
  });
});

// Get a specific PTE Reading question by ID
exports.getPTEReadingById = catchAsync(async (req, res, next) => {
  const pteReading = await PTEReading.findById(req.params.id);
  
  if (!pteReading) {
    return next(new AppError('No PTE Reading question found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      pteReading
    }
  });
});

// Update a PTE Reading question
exports.updatePTEReading = catchAsync(async (req, res, next) => {
  const pteReading = await PTEReading.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!pteReading) {
    return next(new AppError('No PTE Reading question found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      pteReading
    }
  });
});

// Delete a PTE Reading question
exports.deletePTEReading = catchAsync(async (req, res, next) => {
  const pteReading = await PTEReading.findByIdAndDelete(req.params.id);

  if (!pteReading) {
    return next(new AppError('No PTE Reading question found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get PTE Reading questions by type
exports.getPTEReadingByType = catchAsync(async (req, res, next) => {
  const pteReadings = await PTEReading.find({ type: req.params.type });

  res.status(200).json({
    status: 'success',
    results: pteReadings.length,
    data: {
      pteReadings
    }
  });
});

// Get PTE Reading statistics
exports.getPTEReadingStats = catchAsync(async (req, res, next) => {
  const stats = await PTEReading.aggregate([
    {
      $group: {
        _id: '$type',
        numQuestions: { $sum: 1 },
        avgDifficulty: { $avg: '$difficulty' },
        totalPoints: { $sum: '$points' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});
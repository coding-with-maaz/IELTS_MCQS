const PTESpeakingTest = require('../models/PTESpeakingTest');
const PTESpeakingSection = require('../models/PTESpeakingSection');
const SubmittedPTESpeakingTest = require('../models/SubmittedPTESpeakingTest');
const { validateObjectId } = require('../utils/validation');
const { AppError } = require('../utils/errorHandler');

// Create a new PTE Speaking test
exports.createTest = async (req, res, next) => {
  try {
    const { name, description, sections, duration } = req.body;

    // Validate sections
    if (!Array.isArray(sections) || sections.length === 0) {
      throw new AppError('At least one section is required', 400);
    }

    // Create sections
    const createdSections = await Promise.all(
      sections.map(async (section, index) => {
        const newSection = await PTESpeakingSection.create({
          ...section,
          order: index + 1
        });
        return {
          section: newSection._id,
          order: index + 1
        };
      })
    );

    // Create test
    const test = await PTESpeakingTest.create({
      name,
      description,
      sections: createdSections,
      duration
    });

    res.status(201).json({
      status: 'success',
      data: test
    });
  } catch (error) {
    next(error);
  }
};

// Get all PTE Speaking tests
exports.getAllTests = async (req, res, next) => {
  try {
    const tests = await PTESpeakingTest.find()
      .populate({
        path: 'sections.section',
        select: 'title type totalPoints'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: tests.length,
      data: tests
    });
  } catch (error) {
    next(error);
  }
};

// Get a single PTE Speaking test
exports.getTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id);

    const test = await PTESpeakingTest.findById(id)
      .populate({
        path: 'sections.section'
      });

    if (!test) {
      throw new AppError('Test not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: test
    });
  } catch (error) {
    next(error);
  }
};

// Update a PTE Speaking test
exports.updateTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id);

    const { name, description, sections, duration } = req.body;

    const test = await PTESpeakingTest.findById(id);
    if (!test) {
      throw new AppError('Test not found', 404);
    }

    // Update basic info
    if (name) test.name = name;
    if (description) test.description = description;
    if (duration) test.duration = duration;

    // Update sections if provided
    if (sections) {
      // Delete old sections
      await PTESpeakingSection.deleteMany({
        _id: { $in: test.sections.map(s => s.section) }
      });

      // Create new sections
      const createdSections = await Promise.all(
        sections.map(async (section, index) => {
          const newSection = await PTESpeakingSection.create({
            ...section,
            order: index + 1
          });
          return {
            section: newSection._id,
            order: index + 1
          };
        })
      );

      test.sections = createdSections;
    }

    await test.save();

    res.status(200).json({
      status: 'success',
      data: test
    });
  } catch (error) {
    next(error);
  }
};

// Delete a PTE Speaking test
exports.deleteTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id);

    const test = await PTESpeakingTest.findById(id);
    if (!test) {
      throw new AppError('Test not found', 404);
    }

    // Delete all sections
    await PTESpeakingSection.deleteMany({
      _id: { $in: test.sections.map(s => s.section) }
    });

    // Delete the test
    await test.remove();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Reorder sections in a test
exports.reorderSections = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id);

    const { sectionOrders } = req.body;

    const test = await PTESpeakingTest.findById(id);
    if (!test) {
      throw new AppError('Test not found', 404);
    }

    await test.reorderSections(sectionOrders);

    res.status(200).json({
      status: 'success',
      data: test
    });
  } catch (error) {
    next(error);
  }
};

// Get test analytics
exports.getTestAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id);

    const submissions = await SubmittedPTESpeakingTest.find({ test: id })
      .populate('user', 'name email')
      .sort({ completedAt: -1 });

    const analytics = {
      totalSubmissions: submissions.length,
      averageScore: submissions.reduce((acc, sub) => acc + sub.percentage, 0) / submissions.length || 0,
      averageTimeTaken: submissions.reduce((acc, sub) => acc + sub.timeTaken, 0) / submissions.length || 0,
      scoreDistribution: {
        '0-20': 0,
        '21-40': 0,
        '41-60': 0,
        '61-80': 0,
        '81-100': 0
      },
      recentSubmissions: submissions.slice(0, 5).map(sub => ({
        userId: sub.user._id,
        userName: sub.user.name,
        score: sub.percentage,
        completedAt: sub.completedAt
      }))
    };

    // Calculate score distribution
    submissions.forEach(sub => {
      const score = sub.percentage;
      if (score <= 20) analytics.scoreDistribution['0-20']++;
      else if (score <= 40) analytics.scoreDistribution['21-40']++;
      else if (score <= 60) analytics.scoreDistribution['41-60']++;
      else if (score <= 80) analytics.scoreDistribution['61-80']++;
      else analytics.scoreDistribution['81-100']++;
    });

    res.status(200).json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    next(error);
  }
}; 
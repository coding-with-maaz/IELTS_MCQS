const mongoose = require('mongoose');

// Validate MongoDB ObjectId
exports.validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID format');
  }
  return true;
};

// Validate array of ObjectIds
exports.validateObjectIds = (ids) => {
  if (!Array.isArray(ids)) {
    throw new Error('Input must be an array');
  }
  ids.forEach(id => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ID format in array');
    }
  });
  return true;
};

// Validate test duration
exports.validateDuration = (duration) => {
  if (typeof duration !== 'number' || duration < 1) {
    throw new Error('Duration must be a positive number');
  }
  return true;
};

// Validate section order
exports.validateSectionOrder = (order) => {
  if (typeof order !== 'number' || order < 1) {
    throw new Error('Section order must be a positive number');
  }
  return true;
};

// Validate points
exports.validatePoints = (points) => {
  if (typeof points !== 'number' || points < 0) {
    throw new Error('Points must be a non-negative number');
  }
  return true;
};

// Validate criteria array
exports.validateCriteria = (criteria) => {
  if (!Array.isArray(criteria)) {
    throw new Error('Criteria must be an array');
  }
  criteria.forEach(criterion => {
    if (!criterion.name || typeof criterion.name !== 'string') {
      throw new Error('Each criterion must have a name');
    }
    if (!criterion.points || typeof criterion.points !== 'number' || criterion.points < 0) {
      throw new Error('Each criterion must have non-negative points');
    }
  });
  return true;
};

// Validate audio settings
exports.validateAudioSettings = (settings) => {
  if (!settings || typeof settings !== 'object') {
    throw new Error('Audio settings must be an object');
  }
  if (typeof settings.volume !== 'number' || settings.volume < 0 || settings.volume > 1) {
    throw new Error('Volume must be between 0 and 1');
  }
  if (typeof settings.playbackSpeed !== 'number' || settings.playbackSpeed < 0.5 || settings.playbackSpeed > 2) {
    throw new Error('Playback speed must be between 0.5 and 2');
  }
  return true;
}; 
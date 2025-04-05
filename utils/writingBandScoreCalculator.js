function validateScore(score) {
  if (typeof score !== 'number' || score < 0 || score > 9) {
    throw new Error('Score must be a number between 0 and 9');
  }
  return true;
}

function validateGrades(grades) {
  if (!Array.isArray(grades)) {
    throw new Error('Grades must be an array');
  }

  grades.forEach(grade => {
    if (!grade.sectionId) {
      throw new Error('Each grade must have a sectionId');
    }
    if (!grade.taskResponse || !grade.coherenceAndCohesion || 
        !grade.lexicalResource || !grade.grammaticalRangeAndAccuracy) {
      throw new Error('Each grade must have all four assessment criteria');
    }

    validateScore(grade.taskResponse.score);
    validateScore(grade.coherenceAndCohesion.score);
    validateScore(grade.lexicalResource.score);
    validateScore(grade.grammaticalRangeAndAccuracy.score);
  });

  return true;
}

module.exports = {
  validateGrades
}; 
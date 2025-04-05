// Band score calculation for IELTS Reading
function calculateBandScore(correctAnswers, totalQuestions, testType) {
  const percentage = (correctAnswers / totalQuestions) * 100;
  
  // Different scoring tables for Academic and General Training
  const academicScoring = [
    { band: 9.0, minPercentage: 98 },
    { band: 8.5, minPercentage: 91 },
    { band: 8.0, minPercentage: 85 },
    { band: 7.5, minPercentage: 77 },
    { band: 7.0, minPercentage: 69 },
    { band: 6.5, minPercentage: 63 },
    { band: 6.0, minPercentage: 55 },
    { band: 5.5, minPercentage: 47 },
    { band: 5.0, minPercentage: 39 },
    { band: 4.5, minPercentage: 32 },
    { band: 4.0, minPercentage: 23 },
    { band: 3.5, minPercentage: 16 },
    { band: 3.0, minPercentage: 8 },
    { band: 2.5, minPercentage: 0 }
  ];

  const generalScoring = [
    { band: 9.0, minPercentage: 98 },
    { band: 8.5, minPercentage: 89 },
    { band: 8.0, minPercentage: 83 },
    { band: 7.5, minPercentage: 74 },
    { band: 7.0, minPercentage: 67 },
    { band: 6.5, minPercentage: 59 },
    { band: 6.0, minPercentage: 51 },
    { band: 5.5, minPercentage: 43 },
    { band: 5.0, minPercentage: 35 },
    { band: 4.5, minPercentage: 27 },
    { band: 4.0, minPercentage: 19 },
    { band: 3.5, minPercentage: 12 },
    { band: 3.0, minPercentage: 6 },
    { band: 2.5, minPercentage: 0 }
  ];

  const scoringTable = testType === 'academic' ? academicScoring : generalScoring;

  // Find the appropriate band score
  for (const score of scoringTable) {
    if (percentage >= score.minPercentage) {
      return score.band;
    }
  }

  return 0; // Return 0 if percentage is below all thresholds
}

// Calculate performance metrics for each section type
function calculateSectionMetrics(sectionScores) {
  const sectionTypes = {
    'Section 1': { name: 'Factual Information', scores: [] },
    'Section 2': { name: 'Analytical Reading', scores: [] },
    'Section 3': { name: 'Detailed Comprehension', scores: [] }
  };
  
  sectionScores.forEach(section => {
    const sectionNumber = section.sectionName.split(':')[0].trim();
    if (sectionTypes[sectionNumber]) {
      sectionTypes[sectionNumber].scores.push(section.percentage);
    }
  });
  
  const metrics = {};
  Object.keys(sectionTypes).forEach(key => {
    const scores = sectionTypes[key].scores;
    if (scores.length > 0) {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      metrics[key] = {
        name: sectionTypes[key].name,
        averageScore: average.toFixed(2)
      };
    }
  });
  
  return metrics;
}

module.exports = { calculateBandScore, calculateSectionMetrics };
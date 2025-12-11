 const generateAIInsights = (performanceData, attendancePercentage) => {
  const insights = [];
  const subjects = Object.keys(performanceData);

  // Analyze performance per subject
  subjects.forEach(subject => {
    const marks = performanceData[subject];
    if (marks && marks.length > 0) {
      const latestMark = marks[0];
      const averageMark = marks.reduce((sum, val) => sum + val, 0) / marks.length;

      if (latestMark >= 90) {
        insights.push(`Excellent work in ${subject}! You’re maintaining top performance with ${latestMark}%.`);
      } else if (latestMark >= 80) {
        insights.push(`Strong performance in ${subject}. Consider aiming for 90%+ to achieve Grade A.`);
      } else if (latestMark >= 70) {
        const needed = 80 - latestMark;
        insights.push(`Good progress in ${subject}. You need ${needed}% improvement to reach Grade B.`);
      } else if (latestMark >= 60) {
        const needed = 70 - latestMark;
        insights.push(`Focus needed in ${subject}. Aim for ${needed}% improvement to reach Grade C.`);
      } else {
        insights.push(`${subject} requires immediate attention. Consider extra study and practice.`);
      }

      // Trend detection if multiple marks
      if (marks.length >= 2) {
        const trend = marks[0] - marks[1];
        if (trend > 5) {
          insights.push(`Great improvement in ${subject}, gaining ${trend}% since last exam.`);
        } else if (trend < -5) {
          insights.push(`${subject} performance declined by ${Math.abs(trend)}%. Review recent topics.`);
        }
      }
    }
  });

  // Analyze attendance
  if (attendancePercentage >= 95) {
    insights.push(`Outstanding attendance at ${attendancePercentage.toFixed(1)}%! Keep it up.`);
  } else if (attendancePercentage >= 85) {
    insights.push(`Good attendance at ${attendancePercentage.toFixed(1)}%. Aim for above 95% for best results.`);
  } else if (attendancePercentage >= 75) {
    const needed = 85 - attendancePercentage;
    insights.push(`Attendance needs improvement. Increase by ${needed.toFixed(1)}% to reach recommended levels.`);
  } else {
    insights.push(`Critical low attendance at ${attendancePercentage.toFixed(1)}%. This affects your learning greatly.`);
  }

  // Summary of weak and strong subjects
  const weakSubjects = subjects.filter(subj => {
    const marks = performanceData[subj];
    return marks && marks.length > 0 && marks[0] < 70;
  });

  if (weakSubjects.length > 0) {
    insights.push(`Focus areas: ${weakSubjects.join(', ')}. Seek extra help and study more.`);
  }

  const strongSubjects = subjects.filter(subj => {
    const marks = performanceData[subj];
    return marks && marks.length > 0 && marks[0] >= 85;
  });

  if (strongSubjects.length > 0) {
    insights.push(`Your strengths: ${strongSubjects.join(', ')}. Keep leading in these subjects!`);
  }

  // Limit to top 8 insights for brevity
  return insights.slice(0, 8);
};

module.exports = { generateAIInsights };

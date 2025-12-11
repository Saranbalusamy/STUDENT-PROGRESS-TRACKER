/**
 * Formats a percentage score into a letter grade
 * 
 * @param {number} percentage - The percentage score to format
 * @returns {string} The letter grade corresponding to the percentage
 */
const formatGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};

export default formatGrade;
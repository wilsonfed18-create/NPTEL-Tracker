import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../api/axios';

// Register Chart.js components - required before using any chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ---- HELPER: Get selected (best) marks based on course type ----
// This mirrors the backend logic so we can highlight marks on the frontend
const getSelectedMarks = (marks, courseType) => {
  if (courseType === '4 weeks') {
    // All 4 marks are used
    return marks.slice(0, 4);
  }
  // For 8 and 12 weeks, sort descending and pick the best ones
  const sorted = [...marks].sort((a, b) => b - a);
  if (courseType === '8 weeks') return sorted.slice(0, 6);
  if (courseType === '12 weeks') return sorted.slice(0, 8);
  return marks;
};

// ---- HELPER: Calculate assignment score from marks ----
const calcAssignmentScore = (marks, courseType) => {
  const selected = getSelectedMarks(marks, courseType);
  const sum = selected.reduce((acc, m) => acc + m, 0);
  return parseFloat(((sum / (selected.length * 100)) * 25).toFixed(2));
};

// ---- HELPER: Get certificate level from final score ----
const getCertificate = (assignmentScore, examScoreOutOf75, finalScore) => {
  if (assignmentScore >= 10 && examScoreOutOf75 >= 30 && finalScore >= 40) {
    if (finalScore >= 90) return 'Elite + Gold';
    if (finalScore >= 75) return 'Elite + Silver';
    if (finalScore >= 60) return 'Elite';
    return 'Successfully Completed';
  }
  return 'No Certificate';
};

// Certificate badge styles
const certColors = {
  'Elite + Gold': 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  'Elite + Silver': 'bg-gray-100 text-gray-600 border border-gray-300',
  'Elite': 'bg-purple-100 text-purple-700 border border-purple-300',
  'Successfully Completed': 'bg-green-100 text-green-700 border border-green-300',
  'No Certificate': 'bg-red-100 text-red-600 border border-red-300'
};

const CourseDetail = () => {
  const { id } = useParams(); // Get course ID from URL

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // What-if predictor state (live, no submit button needed)
  const [examInput, setExamInput] = useState('');

  // Fetch course data from backend on page load
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);
      } catch (err) {
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading course details...</div>;
  if (error || !course) return <div className="text-center mt-20 text-red-500">{error || 'Course not found'}</div>;

  const { courseName, courseType, assignmentMarks, assignmentScore, isEligible } = course;

  // ---- SECTION 3: Figure out which marks are "selected" (used in score calculation) ----
  const selectedMarks = getSelectedMarks(assignmentMarks, courseType);
  // A mark is "selected" if it appears in the selectedMarks array (by value)
  // We track by index to handle duplicate values correctly
  const selectedCount = selectedMarks.length;
  const selectedSum = selectedMarks.reduce((acc, m) => acc + m, 0);

  // Build a boolean array: isSelected[i] = true if week i+1 mark is selected
  // We do this by sorting indices by mark value descending and picking top N
  const getSelectedIndices = (marks, courseType) => {
    if (courseType === '4 weeks') return marks.map((_, i) => i); // all selected
    const count = courseType === '8 weeks' ? 6 : 8;
    // Create array of [value, originalIndex], sort by value desc, take top N
    return marks
      .map((val, idx) => ({ val, idx }))
      .sort((a, b) => b.val - a.val)
      .slice(0, count)
      .map((item) => item.idx);
  };
  const selectedIndices = new Set(getSelectedIndices(assignmentMarks, courseType));

  // ---- SECTION 5: Live what-if predictor ----
  const examVal = parseFloat(examInput);
  const validExam = !isNaN(examVal) && examVal >= 0 && examVal <= 100;
  const examScoreOutOf75 = validExam ? parseFloat(((examVal / 100) * 75).toFixed(2)) : null;
  const finalScore = validExam ? parseFloat((assignmentScore + examScoreOutOf75).toFixed(2)) : null;
  const certificate = validExam ? getCertificate(assignmentScore, examScoreOutOf75, finalScore) : null;

  // ---- SECTION 7: Per-course analytics ----
  const bestMark = Math.max(...assignmentMarks);
  const lowestMark = Math.min(...assignmentMarks);

  // ---- SECTION 8: Chart.js bar chart data ----
  const chartData = {
    labels: assignmentMarks.map((_, i) => `Week ${i + 1}`),
    datasets: [
      {
        label: 'Marks (out of 100)',
        data: assignmentMarks,
        // Green for selected marks, red/gray for non-selected
        backgroundColor: assignmentMarks.map((_, i) =>
          selectedIndices.has(i) ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.5)'
        ),
        borderColor: assignmentMarks.map((_, i) =>
          selectedIndices.has(i) ? 'rgb(22, 163, 74)' : 'rgb(220, 38, 38)'
        ),
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Assignment Marks per Week' }
    },
    scales: {
      y: { beginAtZero: true, max: 100 }
    }
  };

  // ---- SECTION 9: Smart suggestions ----
  const getSuggestions = () => {
    const tips = [];
    if (assignmentScore < 10) {
      tips.push({ color: 'text-red-600', msg: '⚠️ Your assignment score is below 10. You are not eligible for the exam. Try to improve your assignment marks.' });
    }
    if (validExam && finalScore !== null) {
      if (finalScore < 40) tips.push({ color: 'text-red-600', msg: '❌ Final score is below 40. You will not receive a certificate. Aim for at least 40.' });
      else if (finalScore < 60) tips.push({ color: 'text-yellow-600', msg: '📘 You will get "Successfully Completed". Score 60+ to reach Elite level.' });
      else if (finalScore < 75) tips.push({ color: 'text-blue-600', msg: '🎓 You are at Elite level! Score 75+ to earn Elite + Silver.' });
      else if (finalScore < 90) tips.push({ color: 'text-purple-600', msg: '🥈 You are at Elite + Silver! Score 90+ to earn Elite + Gold.' });
      else tips.push({ color: 'text-yellow-600', msg: '🥇 Excellent! You qualify for Elite + Gold certificate!' });

      if (finalScore >= 55 && finalScore < 60) tips.push({ color: 'text-blue-500', msg: `💡 You are just ${(60 - finalScore).toFixed(2)} marks away from Elite level!` });
      if (finalScore >= 70 && finalScore < 75) tips.push({ color: 'text-purple-500', msg: `💡 You are just ${(75 - finalScore).toFixed(2)} marks away from Elite + Silver!` });
      if (finalScore >= 85 && finalScore < 90) tips.push({ color: 'text-yellow-500', msg: `💡 You are just ${(90 - finalScore).toFixed(2)} marks away from Elite + Gold!` });
    }
    if (!validExam && assignmentScore >= 10) {
      tips.push({ color: 'text-gray-500', msg: '💡 Enter your expected exam marks above to see your predicted certificate level.' });
    }
    return tips;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link to="/dashboard" className="text-blue-500 text-sm hover:underline inline-block mb-2">
        ← Back to Dashboard
      </Link>

      {/* ===== SECTION 1: BASIC INFO ===== */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{courseName}</h2>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded mt-1 inline-block">{courseType}</span>
          </div>
          <span className={`text-sm font-semibold px-4 py-1.5 rounded-full ${isEligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {isEligible ? '✅ Eligible for Exam' : '❌ Not Eligible'}
          </span>
        </div>

        <div className="mt-4 bg-blue-50 rounded-lg p-4 inline-block">
          <p className="text-sm text-gray-500">Assignment Score</p>
          <p className="text-4xl font-bold text-blue-700">{assignmentScore} <span className="text-lg font-normal text-gray-400">/ 25</span></p>
          {!isEligible && <p className="text-xs text-red-500 mt-1">Minimum 10/25 required to be eligible</p>}
        </div>
      </div>

      {/* ===== SECTION 2 & 3: WEEKLY MARKS + HIGHLIGHT BEST ===== */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">📋 Weekly Assignment Marks</h3>
        <p className="text-xs text-gray-400 mb-4">
          Green = selected for score calculation &nbsp;|&nbsp; Red = not selected
          {courseType === '4 weeks' && ' (all 4 marks used)'}
          {courseType === '8 weeks' && ' (best 6 of 8 used)'}
          {courseType === '12 weeks' && ' (best 8 of 12 used)'}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {assignmentMarks.map((mark, index) => {
            const isSelected = selectedIndices.has(index);
            return (
              <div
                key={index}
                className={`rounded-lg p-3 text-center border-2 ${
                  isSelected
                    ? 'bg-green-50 border-green-400'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <p className="text-xs text-gray-400 mb-1">Week {index + 1}</p>
                <p className={`text-xl font-bold ${isSelected ? 'text-green-700' : 'text-red-400'}`}>
                  {mark}
                </p>
                {isSelected && <p className="text-xs text-green-500 mt-0.5">✓ used</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== SECTION 4: CALCULATION BREAKDOWN ===== */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">🧮 Score Calculation Breakdown</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium">Step 1:</span> Course type is <span className="font-semibold text-blue-600">{courseType}</span>
            {courseType === '4 weeks' && ' → All 4 assignment marks are used.'}
            {courseType === '8 weeks' && ' → Best 6 out of 8 assignment marks are used.'}
            {courseType === '12 weeks' && ' → Best 8 out of 12 assignment marks are used.'}
          </p>
          <p>
            <span className="font-medium">Step 2:</span> Selected marks (green) = [{selectedMarks.join(', ')}]
          </p>
          <p>
            <span className="font-medium">Step 3:</span> Sum of selected marks = {selectedSum}
          </p>
          <p>
            <span className="font-medium">Step 4:</span> Maximum possible = {selectedCount} × 100 = {selectedCount * 100}
          </p>
          <div className="bg-blue-50 rounded-lg p-3 mt-2">
            <p className="font-medium text-blue-700">
              Step 5: Assignment Score = ({selectedSum} / {selectedCount * 100}) × 25 = <span className="text-xl">{assignmentScore}</span> / 25
            </p>
          </div>
        </div>
      </div>

      {/* ===== SECTION 5 & 6: WHAT-IF PREDICTOR + CERTIFICATE ===== */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">🔮 What-If Score Predictor</h3>
        <p className="text-xs text-gray-400 mb-4">Results update instantly as you type. No need to click a button.</p>

        {!isEligible && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4">
            ⚠️ You are not eligible for the exam (assignment score &lt; 10). Prediction shown for reference only.
          </div>
        )}

        <div className="flex items-center gap-3 mb-5">
          <input
            type="number"
            value={examInput}
            onChange={(e) => setExamInput(e.target.value)}
            placeholder="Enter expected exam marks (0 – 100)"
            min="0"
            max="100"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Live result - shows as soon as user types a valid number */}
        {validExam && (
          <div className="space-y-4">
            {/* Score breakdown grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Assignment</p>
                <p className="text-xl font-bold text-blue-600">{assignmentScore}</p>
                <p className="text-xs text-gray-400">out of 25</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Exam Marks</p>
                <p className="text-xl font-bold text-orange-500">{examVal}</p>
                <p className="text-xs text-gray-400">out of 100</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                {/* Exam is converted from /100 to /75 because NPTEL gives 75% weightage to exam */}
                <p className="text-xs text-gray-500">Converted Exam</p>
                <p className="text-xl font-bold text-yellow-600">{examScoreOutOf75}</p>
                <p className="text-xs text-gray-400">out of 75</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Final Score</p>
                <p className="text-xl font-bold text-purple-600">{finalScore}</p>
                <p className="text-xs text-gray-400">out of 100</p>
              </div>
            </div>

            {/* Certificate badge */}
            <div className={`rounded-xl p-4 text-center text-lg font-bold ${certColors[certificate]}`}>
              🎓 Certificate: {certificate}
            </div>

            {/* Conditions checklist */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-1.5 text-sm">
              <p className="font-medium text-gray-600 mb-2">Eligibility Conditions:</p>
              <p className={assignmentScore >= 10 ? 'text-green-600' : 'text-red-500'}>
                {assignmentScore >= 10 ? '✅' : '❌'} Assignment Score ≥ 10 &nbsp;→&nbsp; {assignmentScore} / 25
              </p>
              <p className={examScoreOutOf75 >= 30 ? 'text-green-600' : 'text-red-500'}>
                {examScoreOutOf75 >= 30 ? '✅' : '❌'} Converted Exam Score ≥ 30 &nbsp;→&nbsp; {examScoreOutOf75} / 75
              </p>
              <p className={finalScore >= 40 ? 'text-green-600' : 'text-red-500'}>
                {finalScore >= 40 ? '✅' : '❌'} Final Score ≥ 40 &nbsp;→&nbsp; {finalScore} / 100
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ===== SECTION 7: PERFORMANCE ANALYTICS ===== */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">📊 Performance Analytics</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Best Mark</p>
            <p className="text-3xl font-bold text-green-600">{bestMark}</p>
            <p className="text-xs text-gray-400">out of 100</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Lowest Mark</p>
            <p className="text-3xl font-bold text-red-500">{lowestMark}</p>
            <p className="text-xs text-gray-400">out of 100</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Weeks</p>
            <p className="text-3xl font-bold text-blue-600">{assignmentMarks.length}</p>
            <p className="text-xs text-gray-400">assignments</p>
          </div>
        </div>
      </div>

      {/* ===== SECTION 8: BAR CHART ===== */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">📈 Marks Chart</h3>
        <p className="text-xs text-gray-400 mb-4">Green bars = marks used in score calculation. Red bars = not used.</p>
        {/* Bar chart using Chart.js - shows marks for each week visually */}
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* ===== SECTION 9: SMART SUGGESTIONS ===== */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">💡 Smart Suggestions</h3>
        <div className="space-y-2">
          {getSuggestions().map((tip, i) => (
            <p key={i} className={`text-sm ${tip.color}`}>{tip.msg}</p>
          ))}
        </div>
      </div>

      {/* Edit button at the bottom */}
      <div className="flex gap-3 pb-4">
        <Link
          to={`/edit-course/${id}`}
          className="bg-yellow-500 text-white px-5 py-2 rounded-lg text-sm hover:bg-yellow-600"
        >
          ✏️ Edit Course
        </Link>
        <Link
          to="/dashboard"
          className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg text-sm hover:bg-gray-200"
        >
          ← Dashboard
        </Link>
      </div>
    </div>
  );
};

export default CourseDetail;

/*
 * FILE EXPLANATION:
 * This is the Course Detail page - the main analysis page for a single course.
 * It is opened when the user clicks "View Details" on a course card in the dashboard.
 *
 * SECTION 1 - Basic Info: Shows course name, type, assignment score, and eligibility.
 *
 * SECTION 2 & 3 - Weekly Marks with Highlights:
 *   getSelectedIndices() figures out which weeks are used in the score calculation.
 *   Green = selected (used), Red = not selected (not used).
 *
 * SECTION 4 - Calculation Breakdown:
 *   Shows step-by-step how the assignment score was calculated.
 *   Useful for understanding and explaining in viva.
 *
 * SECTION 5 & 6 - What-If Predictor:
 *   User types exam marks (out of 100). Results update LIVE without any button click.
 *   Exam marks are converted to /75 because NPTEL gives 75% weightage to exam.
 *   Formula: examScoreOutOf75 = (examMarks / 100) * 75
 *   finalScore = assignmentScore + examScoreOutOf75
 *
 * SECTION 7 - Performance Analytics:
 *   Uses Math.max() and Math.min() to find best and lowest marks.
 *
 * SECTION 8 - Bar Chart:
 *   Uses Chart.js (react-chartjs-2) to draw a bar chart of weekly marks.
 *   Green bars = marks used in calculation, Red bars = not used.
 *
 * SECTION 9 - Smart Suggestions:
 *   Simple if-else conditions that give the student helpful tips based on their scores.
 */

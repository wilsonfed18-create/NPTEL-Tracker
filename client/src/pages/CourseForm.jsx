import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

// This component is used for BOTH adding and editing a course
const CourseForm = () => {
  const { id } = useParams(); // If 'id' exists in URL, we are editing; otherwise adding
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState('');
  const [courseType, setCourseType] = useState('4 weeks');
  const [marksInput, setMarksInput] = useState(''); // Comma-separated string input
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // How many marks are required based on course type
  const requiredMarks = { '4 weeks': 4, '8 weeks': 8, '12 weeks': 12 };

  // If editing, load the existing course data
  useEffect(() => {
    if (isEditing) {
      const fetchCourse = async () => {
        try {
          const res = await api.get(`/courses/${id}`);
          setCourseName(res.data.courseName);
          setCourseType(res.data.courseType);
          setMarksInput(res.data.assignmentMarks.join(', ')); // Convert array to string
        } catch (err) {
          setError('Failed to load course');
        }
      };
      fetchCourse();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Parse the comma-separated marks string into an array of numbers
    const assignmentMarks = marksInput
      .split(',')
      .map((m) => parseFloat(m.trim()))
      .filter((m) => !isNaN(m));

    // Validate number of marks
    const required = requiredMarks[courseType];
    if (assignmentMarks.length !== required) {
      setError(`Please enter exactly ${required} marks for a ${courseType} course.`);
      return;
    }

    // Validate each mark is between 0 and 100
    if (assignmentMarks.some((m) => m < 0 || m > 100)) {
      setError('Each mark must be between 0 and 100.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/courses/${id}`, { courseName, courseType, assignmentMarks });
      } else {
        await api.post('/courses', { courseName, courseType, assignmentMarks });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditing ? '✏️ Edit Course' : '➕ Add New Course'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Introduction to Python"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
            <select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="4 weeks">4 Weeks</option>
              <option value="8 weeks">8 Weeks</option>
              <option value="12 weeks">12 Weeks</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignment Marks
            </label>
            <p className="text-xs text-gray-400 mb-1">
              Enter exactly {requiredMarks[courseType]} marks (0–100) separated by commas
            </p>
            <input
              type="text"
              value={marksInput}
              onChange={(e) => setMarksInput(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={courseType === '4 weeks' ? '80, 90, 70, 85' : courseType === '8 weeks' ? '80, 90, 70, 85, 60, 75, 88, 92' : '80, 90, 70, 85, 60, 75, 88, 92, 78, 65, 82, 95'}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Course' : 'Add Course'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;

/*
 * FILE EXPLANATION:
 * This component handles both adding a new course and editing an existing one.
 * useParams() gets the course ID from the URL (e.g., /edit-course/abc123).
 * If 'id' exists, we're in edit mode; otherwise we're in add mode.
 * The marks are entered as a comma-separated string (e.g., "80, 90, 70, 85").
 * We split and parse that string into an array of numbers before sending to the API.
 * Validation checks that the correct number of marks are entered for the course type.
 * On success, the user is redirected back to the dashboard.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all courses when the page loads
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []); // Empty array means this runs only once when component mounts

  // Remove a course from the list after deletion
  const handleDelete = (deletedId) => {
    setCourses(courses.filter((c) => c._id !== deletedId));
  };

  // ---- Calculate dashboard stats ----
  const totalCourses = courses.length;
  const eligibleCourses = courses.filter((c) => c.isEligible).length;
  const notEligibleCourses = totalCourses - eligibleCourses;
  const avgScore = totalCourses > 0
    ? (courses.reduce((sum, c) => sum + c.assignmentScore, 0) / totalCourses).toFixed(2)
    : 0;

  // ---- Performance analytics ----
  const allMarks = courses.flatMap((c) => c.assignmentMarks); // Combine all marks into one array
  const bestMark = allMarks.length > 0 ? Math.max(...allMarks) : 'N/A';
  const lowestMark = allMarks.length > 0 ? Math.min(...allMarks) : 'N/A';

  if (loading) {
    return <div className="text-center mt-20 text-gray-500">Loading your courses...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
        <Link
          to="/add-course"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + Add Course
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-700">{totalCourses}</p>
          <p className="text-sm text-gray-600 mt-1">Total Courses</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{eligibleCourses}</p>
          <p className="text-sm text-gray-600 mt-1">Eligible</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-500">{notEligibleCourses}</p>
          <p className="text-sm text-gray-600 mt-1">Not Eligible</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{avgScore}</p>
          <p className="text-sm text-gray-600 mt-1">Avg Score /25</p>
        </div>
      </div>

      {/* Performance Analytics */}
      {allMarks.length > 0 && (
        <div className="bg-white rounded-xl shadow p-5 mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">📊 Performance Analytics</h2>
          <div className="flex gap-6 flex-wrap">
            <div>
              <p className="text-sm text-gray-500">Best Assignment Mark</p>
              <p className="text-xl font-bold text-green-600">{bestMark} / 100</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lowest Assignment Mark</p>
              <p className="text-xl font-bold text-red-500">{lowestMark} / 100</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Assignments Tracked</p>
              <p className="text-xl font-bold text-blue-600">{allMarks.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Course Cards */}
      {courses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No courses added yet.</p>
          <Link to="/add-course" className="text-blue-500 hover:underline text-sm mt-2 inline-block">
            Add your first course →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

/*
 * FILE EXPLANATION:
 * This is the main Dashboard page shown after login.
 * useEffect() fetches all courses from the backend when the page loads.
 * Stats are calculated from the courses array: total, eligible, not eligible, average score.
 * Performance analytics finds the best and lowest marks across ALL courses.
 * flatMap() combines all assignment marks from all courses into one flat array.
 * Math.max() and Math.min() find the highest and lowest values in that array.
 * handleDelete() removes a course from the local state after it's deleted from the database.
 * CourseCard component is used to display each course in a grid layout.
 */

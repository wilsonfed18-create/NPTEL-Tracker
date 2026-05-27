import { Link } from 'react-router-dom';
import api from '../api/axios';

const CourseCard = ({ course, onDelete }) => {
  const { _id, courseName, courseType, assignmentMarks, assignmentScore, isEligible } = course;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${_id}`);
      onDelete(_id); // Tell parent component to remove this card from the list
    } catch (error) {
      alert('Failed to delete course');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
      {/* Course name and type */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{courseName}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{courseType}</span>
        </div>
        {/* Eligibility badge */}
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isEligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {isEligible ? '✅ Eligible' : '❌ Not Eligible'}
        </span>
      </div>

      {/* Assignment score */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">Assignment Score (out of 25)</p>
        <p className="text-2xl font-bold text-blue-600">{assignmentScore}</p>
      </div>

      {/* All marks */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">Assignment Marks:</p>
        <div className="flex flex-wrap gap-1">
          {assignmentMarks.map((mark, index) => (
            <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">
              Week {index + 1}: {mark}
            </span>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Link
          to={`/course/${_id}`}
          className="flex-1 text-center text-sm bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700"
        >
          View Details
        </Link>
        <Link
          to={`/edit-course/${_id}`}
          className="flex-1 text-center text-sm bg-yellow-500 text-white py-1.5 rounded hover:bg-yellow-600"
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          className="flex-1 text-sm bg-red-500 text-white py-1.5 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default CourseCard;

/*
 * FILE EXPLANATION:
 * This component displays a single course as a card.
 * It shows the course name, type, assignment score, all marks, and eligibility status.
 * Green badge = eligible for exam, Red badge = not eligible.
 * handleDelete() asks for confirmation then calls the API to delete the course.
 * onDelete() is a function passed from the parent (Dashboard) to update the list.
 * The card has 3 action buttons: View/Predict, Edit, and Delete.
 */

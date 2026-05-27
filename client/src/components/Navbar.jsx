import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link to="/dashboard" className="text-xl font-bold tracking-wide">
         NPTEL Tracker
      </Link>

      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-200">Hello, {user.name}</span>
          <Link to="/dashboard" className="text-sm hover:underline">Dashboard</Link>
          <Link to="/add-course" className="text-sm hover:underline">Add Course</Link>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-700 text-sm px-3 py-1 rounded hover:bg-blue-100"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

/*
 * FILE EXPLANATION:
 * This is the top navigation bar shown on all pages.
 * It shows the app name, navigation links, and a logout button.
 * useAuth() gives us the current user info and logout function.
 * useNavigate() lets us redirect the user after logout.
 * The navbar only shows links if the user is logged in.
 */

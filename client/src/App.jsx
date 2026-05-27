import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseForm from './pages/CourseForm';
import CourseDetail from './pages/CourseDetail';

// ProtectedRoute: redirects to login if user is not logged in
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Redirect root to dashboard if logged in, else to login */}
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

        {/* Protected routes - only accessible when logged in */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/add-course" element={<ProtectedRoute><CourseForm /></ProtectedRoute>} />
        <Route path="/edit-course/:id" element={<ProtectedRoute><CourseForm /></ProtectedRoute>} />
        <Route path="/course/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

/*
 * FILE EXPLANATION:
 * This is the root component of the React app. It sets up routing and global context.
 * BrowserRouter enables client-side routing (changing pages without full reload).
 * AuthProvider wraps everything so all components can access user login state.
 * ProtectedRoute is a wrapper that checks if the user is logged in.
 *   If not logged in, it redirects to /login automatically.
 * Routes are defined with path and the component to show for that path.
 * :id in the path is a dynamic segment (e.g., /course/abc123 → id = "abc123").
 * Logged-in users are redirected away from login/register pages to dashboard.
 */

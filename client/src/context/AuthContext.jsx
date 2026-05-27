import { createContext, useContext, useState } from 'react';

// Create a context to share auth state across all components
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Check if user is already logged in (token saved in localStorage)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Save user info and token to localStorage on login
  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  // Clear everything on logout
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use auth context in any component
export const useAuth = () => useContext(AuthContext);

/*
 * FILE EXPLANATION:
 * This file manages the global authentication state using React Context.
 * Context lets us share data (like user info) across all components without prop drilling.
 * AuthProvider wraps the whole app so every component can access user state.
 * login() saves user data and token to localStorage so the user stays logged in on refresh.
 * logout() clears everything and logs the user out.
 * useAuth() is a custom hook - any component can call useAuth() to get user info.
 */

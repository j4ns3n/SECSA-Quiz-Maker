import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/login/login';
import Register from './pages/register/register';
import { UserContextProvider } from './context/UserContext/UserContext';
import { CourseContextProvider } from './context/CourseContext/CourseContext';
import Dashboard from './pages/dashboard/dashboard';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <UserContextProvider>
          <AppRoutes />
        </UserContextProvider>
      </BrowserRouter>
    </div>
  );
}

// Separate component to handle routing and authentication checks
function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation(); // Hook to track route changes

  // Check authentication status whenever the route changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token); // True if token exists, false otherwise
    };
    checkAuth();
  }, [location]); // Re-run auth check whenever location (route) changes

  const handleLogin = () => {
    localStorage.setItem('authToken', 'your_token_here'); // Set token on login
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear token on logout
    setIsAuthenticated(false); // Update state
  };

  return (
    <Routes>
      {/* Redirect to courses if authenticated */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/courses" replace /> : <Login onLogin={handleLogin} />}
      />
      <Route path="/register" element={<Register />} />
      {/* Protected routes */}
      <Route
        path="/*"
        element={isAuthenticated ? <CourseApp onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

function CourseApp({ onLogout }) {
  return (
    <CourseContextProvider>
      <div className="pages">
        <Routes>
          <Route path="/courses" element={<Dashboard />} />
          {/* Add a route for logout that triggers the onLogout */}
          <Route
            path="/logout"
            element={<Navigate to="/login" replace />}  // Redirect after logout
          />
        </Routes>
      </div>
    </CourseContextProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CourseNavbar from './components/courses/CourseNavbar';
import CourseHome from './pages/courses/courseHome';
import Login from './pages/login/login';
import Register from './pages/register/register';
import { UserContextProvider } from './context/UserContext/UserContext';
import { CourseContextProvider } from './context/CourseContext/CourseContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token); // True if token exists, false otherwise
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear token on logout
    setIsAuthenticated(false); // Update state
  };

  return (
    <div className="App">
      <BrowserRouter>
        <UserContextProvider>
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/home" replace /> : <Login onLogin={handleLogin} />}
            />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={isAuthenticated ? <CourseApp onLogout={handleLogout} /> : <Navigate to="/login" replace />}
            />
          </Routes>
        </UserContextProvider>
      </BrowserRouter>
    </div>
  );
}

function CourseApp({ onLogout }) {
  return (
    <CourseContextProvider>
      <CourseNavbar onLogout={onLogout} />
      <div className="pages">
        <Routes>
          <Route path="/home" element={<CourseHome />} />
        </Routes>
      </div>
    </CourseContextProvider>
  );
}

export default App;

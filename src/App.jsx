import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/login/login';
import { UserContextProvider } from './context/UserContext/UserContext';
import { CourseContextProvider } from './context/CourseContext/CourseContext';
import Dashboard from './pages/dashboard/dashboard';
import { jwtDecode } from 'jwt-decode';
import QuizApp from './pages/quizapp';
import QuizPage from './components/quizes/quizPage';

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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);

        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          navigate('/login');
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    };

    checkAuth();
  }, [location, navigate]);

  const handleLogin = () => {
    localStorage.setItem('authToken', localStorage.getItem('authToken')); // Set token on login
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear token on logout
    setIsAuthenticated(false); // Update state
  };

  // Disable right-click and certain keyboard shortcuts
  // useEffect(() => {
  //   const handleContextMenu = (e) => e.preventDefault(); // Disable right-click
  //   const handleKeyDown = (e) => {
  //     if (
  //       e.key === "F12" || // F12 key
  //       (e.ctrlKey && e.shiftKey && e.key === "I") || // Ctrl+Shift+I
  //       (e.ctrlKey && e.shiftKey && e.key === "J") || // Ctrl+Shift+J
  //       (e.ctrlKey && e.key === "U") || // Ctrl+U
  //       (e.ctrlKey && e.key === "S") // Ctrl+S
  //     ) {
  //       e.preventDefault();
  //     }
  //   };

  //   // Attach event listeners
  //   document.addEventListener("contextmenu", handleContextMenu);
  //   document.addEventListener("keydown", handleKeyDown);

  //   // Clean up event listeners on component unmount
  //   return () => {
  //     document.removeEventListener("contextmenu", handleContextMenu);
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);

  return (
    <Routes>
      {/* Redirect to courses if authenticated */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
      />
      <Route path="/exam" element={<QuizApp />} />
      <Route path="/exam/:quizTitle" element={<QuizPage />} />
      {/* Protected routes */}
      <Route
        path="/*"
        element={isAuthenticated ? <CourseApp onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

function CourseApp() {
  return (
    <CourseContextProvider>
      <div className="pages">
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </CourseContextProvider>
  );
}

export default App;

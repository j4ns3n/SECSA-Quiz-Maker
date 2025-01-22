import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/login/login';
import { UserContextProvider } from './context/UserContext/UserContext';
import { CourseContextProvider } from './context/CourseContext/CourseContext';
import Dashboard from './pages/dashboard/dashboard';
import { jwtDecode } from 'jwt-decode';
import QuizApp from './pages/quizapp';
import QuizPage from './components/quizes/quiz/quizPage';
import QuizCode from './components/quizes/quiz/quizCode';
import RecentExams from './components/quizes/exams/recentExams';
import ReviewPage from './components/quizes/exams/reviewPage';
import { StudentProfile } from './components/quizes/studentProfile';

function App() {
  return (
    <div className="App" style={{ userSelect: "none" }} >
      <BrowserRouter>
        <UserContextProvider>
          <AppRoutes />
        </UserContextProvider>
      </BrowserRouter>
    </div>
  );
}

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
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
          setRole(decodedToken.role);  // Set role from the token
        }
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    };

    checkAuth();
  }, [location, navigate]);

  useEffect(() => {
    const handleBlur = () => {
      if (role === "Student") {
        handleLogout();
        alert("You have been logged out because you switched tabs or windows.");
      }
    };

    const handleFocus = () => {
      console.log("Tab is focused again.");
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [role]);

  const handleLogin = (role) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;

      sessionStorage.setItem('userRole', userRole);
      setIsAuthenticated(true);
      setRole(userRole);

      if (userRole === 'Student') {
        navigate('/exam');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setRole(null);
    navigate('/login');
  };

  // Disable right-click and certain keyboard shortcuts
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault(); // Disable right-click
    const handleKeyDown = (e) => {
      if (
        e.key === "F12" || // F12 key
        (e.ctrlKey && e.shiftKey && e.key === "I") || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.key === "J") || // Ctrl+Shift+J
        (e.ctrlKey && e.key === "U") || // Ctrl+U
        (e.ctrlKey && e.key === "S") // Ctrl+S
      ) {
        e.preventDefault();
      }
    };

    // Attach event listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // Clean up event listeners on component unmount
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Routes>
      {/* If the user is authenticated, redirect based on the role */}
      <Route
        path="/login"
        element={isAuthenticated ? (
          <Navigate to={role === 'Student' ? '/exam' : '/'} replace />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      />

      {/* Routes for students (quiz page) */}
      <Route
        path="/exam"
        element={isAuthenticated && role === 'Student' ? <QuizApp /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/exam/code"
        element={isAuthenticated && role === 'Student' ? <QuizCode /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/exam/recent-exams"
        element={isAuthenticated && role === 'Student' ? <RecentExams /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/exam/recent-exams/review"
        element={isAuthenticated && role === 'Student' ? <ReviewPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/exam/:quizTitle"
        element={isAuthenticated && role === 'Student' ? <QuizPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/student/profile"
        element={isAuthenticated && role === 'Student' ? <StudentProfile /> : <Navigate to="/login" replace />}
      />
      {/* Protected routes based on authentication */}
      <Route
        path="/*"
        element={isAuthenticated ? (
          role === 'Student' ? (
            <Navigate to="/exam" replace />
          ) : (
            <CourseApp onLogout={handleLogout} />
          )
        ) : (
          <Navigate to="/login" replace />
        )}
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

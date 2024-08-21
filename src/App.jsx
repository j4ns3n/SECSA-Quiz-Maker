import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CourseNavbar from './components/courses/CourseNavbar';
import CourseHome from './pages/courses/courseHome';
import { CourseContextProvider } from './context/CourseContext/CourseContext';
import Login from './pages/login/login';
import Register from './pages/register/register';
import { UserContextProvider } from './context/UserContext/UserContext';
import { useUserContext } from './hooks/useUserContext';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <UserContextProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protect routes by checking authentication */}
            <Route 
              path="/*" 
              element={<PrivateRoute><CourseApp /></PrivateRoute>} 
            />
          </Routes>
        </UserContextProvider>
      </BrowserRouter>
    </div>
  );
}

// CourseApp is extracted for simplicity
function CourseApp() {
  return (
    <CourseContextProvider>
      <CourseNavbar />
      <div className="pages">
        <Routes>
          <Route path="/home" element={<CourseHome />} />
        </Routes>
      </div>
    </CourseContextProvider>
  );
}

// PrivateRoute to protect routes
function PrivateRoute({ children }) {
  const { user } = useUserContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default App;

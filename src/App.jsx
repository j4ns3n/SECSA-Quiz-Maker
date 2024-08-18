import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import Home from './pages/home';
// import Navbar from './components/Navbar';
import CourseNavbar from './components/courses/CourseNavbar';
import CourseHome from './pages/courses/courseHome';
import { CourseContextProvider } from './context/CourseContext/CourseContext';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <CourseContextProvider>
          {/* <Navbar /> */}
          <CourseNavbar />
          <div className="pages">
            <Routes>
              <Route 
                path='/'
                element={
                  <CourseHome />
                }
              />
            </Routes>
          </div>
        </CourseContextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

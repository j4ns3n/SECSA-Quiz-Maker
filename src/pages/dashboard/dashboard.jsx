import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import FeedIcon from '@mui/icons-material/Feed';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { orange } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';
import LogoSecsa from '../../assets/secsalogo.png';
import { useCoursesContext } from '../../hooks/useCourseContext';
import CourseCards from '../../components/courses/courseCards';
import { useEffect } from "react"


// Navigation config
const NAVIGATION = [
  {
    segment: 'courses',
    title: 'Courses',
    icon: <FeedIcon />,
  },
  {
    segment: 'exams',
    title: 'Exams',
    icon: <MenuBookIcon />,
  },
  {
    segment: 'users',
    title: 'Users',
    icon: <PeopleAltIcon />,
  },
  {
    segment: 'logout',
    title: 'Logout',
    icon: <LogoutIcon />,
  },
];

// Theme setup
const demoTheme = createTheme({
  palette: {
    primary: {
      main: orange[700],
      dark: orange[700],
    },
  },
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});




function DemoPageContent({ pathname }) {

  const { courses, dispatch } = useCoursesContext();

  useEffect(() => {
    const fetchCourse = async () => {
      const response = await fetch('/api/courses');
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'SET_COURSES', payload: json });
      }
    };

    fetchCourse();
  }, [dispatch]);

  // This function will render different components based on the current path
  const renderContent = () => {
    switch (pathname) {
      case '/courses':
        return <CourseCards courses={courses} />;
      case '/exams':
        return <div>Exams Component Placeholder</div>; // Replace with your Exams component
      case '/users':
        return <div>Users Component Placeholder</div>; // Replace with your Users component
      default:
        return <div>Page Not Found</div>;
    }
  };

  return <>{renderContent()}</>;
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function Dashboard(props) {
  console.log(localStorage.getItem('authToken'));
  const { window } = props;

  const [pathname, setPathname] = React.useState('/courses'); // Default route is /courses
  const navigate = useNavigate(); // React Router's navigate

  const handleNavigation = (segment) => {
    if (segment === 'logout') {
      sessionStorage.clear();
      localStorage.clear();
      navigate('/login'); // Navigate to login page on logout
    } else {
      setPathname(`/${segment}`); // Set the path based on clicked segment
    }
  };

  const router = React.useMemo(
    () => ({
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    }),
    [pathname]
  );

  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <AppProvider
      navigation={NAVIGATION.map((navItem) => ({
        ...navItem,
        onClick: () => handleNavigation(navItem.segment), // Attach onClick handler to navigation items
      }))}
      branding={{
        logo: <img src={LogoSecsa} alt="SECSA logo" />,
        title: 'SECSA Quiz Maker',
      }}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout>
        <DemoPageContent pathname={pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}

Dashboard.propTypes = {
  window: PropTypes.func,
};

export default Dashboard;

import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import FeedIcon from '@mui/icons-material/Feed';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { orange } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';
import LogoSecsa from '../../assets/secsalogo.png';
import CourseCards from '../../components/courses/courseCards';
import Exam from '../../components/exam/exam';
import User from '../../components/users/userComponent';
import BarChartIcon from '@mui/icons-material/BarChart';
import Overview from '../../components/overview/overview';
// import Footer from '../../components/Footer';

// Navigation config
const NAVIGATION = [
  {
    segment: 'overview',
    title: 'Overview',
    icon: <BarChartIcon />,
  },
  {
    segment: 'courses',
    title: 'Courses',
    icon: <FeedIcon />,
  },
  {
    segment: 'exams',
    title: 'Assessment',
    icon: <MenuBookIcon />,
  },
  {
    segment: 'users',
    title: 'Users',
    icon: <PeopleAltIcon />,
  }
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

function DemoPageContent({ pathname, onLogout }) {
  const renderContent = () => {
    switch (pathname) {
      case '/courses':
        return <CourseCards />;
      case '/exams':
        return <Exam />;
      case '/overview':
        return <Overview />;
      case '/users':
        return <User />;
      default:
        return <div>Page Not Found</div>;
    }
  };

  return <>{renderContent()}</>;
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
  onLogout: PropTypes.func.isRequired,
};

function Dashboard(props) {
  const { window } = props;
  const [pathname, setPathname] = React.useState('/overview');
  const navigate = useNavigate();

  const role = sessionStorage.getItem('userRole');
  const firstName = sessionStorage.getItem('firstName');
  const middleName = sessionStorage.getItem('middleName');
  const lastName = sessionStorage.getItem('lastName');
  const email = sessionStorage.getItem('email');

  const [session, setSession] = React.useState({
    user: {
      name: `${firstName} ${middleName} ${lastName}`,
      email: email,
    },
  });

  const handleLogout = React.useCallback(() => {
    sessionStorage.clear();
    localStorage.clear();
    navigate('/login', { replace: true });
  }, [navigate]);

  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        setSession({});
      },
      signOut: () => {
        setSession(null);
        handleLogout();
      },
    };
  }, [handleLogout]);

  const router = React.useMemo(
    () => ({
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    }),
    [pathname]
  );

  const demoWindow = window !== undefined ? window() : undefined;

  const filteredNavigation = NAVIGATION.filter(navItem => {
    if (role === 'all' && navItem.segment === 'users') {
      return false;
    }
    return true;
  });

  return (
    <AppProvider
      navigation={filteredNavigation.map((navItem) => ({
        ...navItem,
        onClick: () => setPathname(`/${navItem.segment}`),
      }))}
      branding={{
        logo: <img src={LogoSecsa} alt="SECSA logo" />,
        title: 'SECSA Quiz Maker',
      }}
      router={router}
      theme={demoTheme}
      window={demoWindow}
      authentication={authentication}
      session={session}
    >
      <DashboardLayout>
        <DemoPageContent sx={{ paddingBottom: '64px' }} pathname={pathname} onLogout={handleLogout} />
        {/* <Footer /> */}
      </DashboardLayout>
    </AppProvider>
  );
}

Dashboard.propTypes = {
  window: PropTypes.func,
};

export default Dashboard;
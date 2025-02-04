import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Container, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import LogoSecsa from '../assets/secsalogo.png';
import LogoutIcon from '@mui/icons-material/Logout';
import scbackground from '../assets/sbbg.png'
import PersonIcon from '@mui/icons-material/Person';

const QuizApp = () => {
    const navigate = useNavigate(); // Initialize navigate
    const [hover, setHover] = useState(false);
    const [hover1, setHover1] = useState(false);


    const handleJoinClick = async () => {
        navigate('/exam/code', { replace: true });
    };

    const handleRecentExams = async () => {
        navigate('/exam/recent-exams', { replace: true });
    };

    const handleStudentProfile = async () => {
        navigate('/student/profile', { replace: true });
    };

    const handleLogout = React.useCallback(() => {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/login', { replace: true });
    }, [navigate]);

    return (
        <div style={{
            height: '100vh',
            backgroundImage: `url(${scbackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            color: '#fff'
        }}>
            <AppBar position="static" style={{
                backgroundColor: 'transparent',
                boxShadow: '0 2px 15px rgba(0, 0, 0, 0.3)'
            }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <img src={LogoSecsa} alt="logo" style={{ height: '40px' }} />
                    </Typography>
                    <Button
                        style={{
                            color: hover1 ? '#FF9201' : '#fff',
                            transition: 'background-color 0.3s, color 0.3s',
                        }}
                        onMouseEnter={() => setHover1(true)}
                        onMouseLeave={() => setHover1(false)}
                        onClick={handleStudentProfile}
                    >
                        Profile <PersonIcon />
                    </Button>
                    <Button
                        style={{
                            color: hover ? '#FF9201' : '#fff',
                            transition: 'background-color 0.3s, color 0.3s',
                        }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        onClick={handleLogout}
                    >
                        Logout <LogoutIcon sx={{ paddingLeft: '3px' }} />
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '15vh' }}>
                <Typography variant="h3" style={{ marginBottom: '50px', fontWeight: 'bold' }}>
                    SECSA Quiz Generator
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, padding: '20px' }}>
                    <Button
                        variant="contained"
                        style={{ backgroundColor: '#fff', color: "#000" }}
                        onClick={handleJoinClick}
                        size="large"
                    >
                        Join Exam
                    </Button>
                    <Button
                        variant="contained"
                        style={{ backgroundColor: '#fff', color: "#000" }}
                        onClick={handleRecentExams}
                        size="large"
                    >
                        Recent Exams
                    </Button>
                </Box>
            </Container>
        </div>
    );
};

export default QuizApp;

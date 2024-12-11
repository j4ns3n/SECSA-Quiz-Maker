import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Container, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import LogoSecsa from '../assets/secsalogo.png';
import LogoutIcon from '@mui/icons-material/Logout';

const QuizApp = () => {
    const navigate = useNavigate(); // Initialize navigate
    const [hover, setHover] = useState(false);


    const handleJoinClick = async () => {
        navigate('/exam/code', { replace: true });
    };

    const handleRecentExams = async () => {
        navigate('/exam/recent-exams', { replace: true });
    };

    const handleLogout = React.useCallback(() => {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/login', { replace: true });
    }, [navigate]);

    return (
        <div style={{
            height: '100vh',
            background: 'linear-gradient(to right, #FCC31A, #FF9201, #DE791E)',
            color: '#fff'
        }}>
            <AppBar position="static" style={{ backgroundColor: '#FF9201' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <img src={LogoSecsa} alt="logo" style={{ height: '40px' }} />
                    </Typography>

                    <Button
                        style={{
                            backgroundColor: hover ? '#fff' : '#FF9201',
                            color: hover ? '#FF9201' : '#fff',
                            border: '1px solid #FF9201',
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
                    SECSA Quiz Maker
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, padding: '20px' }}>
                    <Button
                        variant="outlined"
                        style={{ backgroundColor: '#fff', color: "#000" }}
                        onClick={handleJoinClick}
                    >
                        Join Exam
                    </Button>
                    <Button
                        variant="outlined"
                        style={{ backgroundColor: '#fff', color: "#000" }}
                        onClick={handleRecentExams}
                    >
                        Recent Exams
                    </Button>
                </Box>
            </Container>
        </div>
    );
};

export default QuizApp;

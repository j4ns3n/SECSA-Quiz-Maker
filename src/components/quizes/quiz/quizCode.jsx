import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, TextField, Container, Box, Typography, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import LogoSecsa from '../../../assets/secsalogo.png';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import scbackground from '../../../assets/sbbg.png';

const QuizCode = () => {
    const [quizCode, setQuizCode] = useState('');
    const [error, setError] = useState('');
    const [quizData, setQuizData] = useState(null); // Store quiz data once fetched
    const navigate = useNavigate(); // Initialize navigate
    // const [courseAndYearLevel, setCourseAndYearLevel] = useState('');
    const [hover, setHover] = useState(false);

    useEffect(() => {
        console.log(quizData);
        if (quizData) {
            const name = sessionStorage.getItem('firstName') + ' ' + sessionStorage.getItem('middleName') + ' ' + sessionStorage.getItem('lastName');
            const yearLevel = sessionStorage.getItem('yearLevel');
            const course = sessionStorage.getItem('course');
            let courseAndYearLevel;

            if (yearLevel === '1st Year') {
                courseAndYearLevel = 1;
            } else if (yearLevel === '2nd Year') {
                courseAndYearLevel = 2;
            } else if (yearLevel === '3rd Year') {
                courseAndYearLevel = 3;
            } else if (yearLevel === '4th Year') {
                courseAndYearLevel = 4;
            }

            const userData = {
                name: name,
                course: course + ' ' + courseAndYearLevel
            };

            // Now perform the navigation after state has been updated
            navigate(`/exam/${quizData.title}`, { state: { quizData, userData } });
        }
    }, [quizData, navigate]);

    const handleJoinClick = async () => {
        if (!quizCode) {
            setError('Quiz code is required.');
            return;
        }
        if (quizCode.length < 5) { 
            setError('Quiz code must be at least 5 characters long.');
            return;
        }
        try {
            const response = await fetch(`/api/exams/${quizCode}`);

            if (!response.ok) {
                throw new Error('Quiz not found, please check the code.');
            }

            const data = await response.json();

            if (data) {
                setQuizData(data);
                setError('');
            } else {
                setError('Quiz not found, please check the code.');
            }
        } catch (err) {
            console.error(err);
            setError('Quiz not found, please check the code.');
        }
    };


    const handleLogout = React.useCallback(() => {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/login', { replace: true });
    }, [navigate]);

    const handleBack = async () => {
        navigate('/exam');
    }

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
                    SECSA Quiz Maker
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, padding: '20px' }}>
                    <IconButton onClick={handleBack}><ArrowBackIcon sx={{ color: '#FFFF' }} /></IconButton>
                    <TextField
                        value={quizCode}
                        onChange={(e) => setQuizCode(e.target.value)}
                        variant="outlined"
                        placeholder="Enter quiz code"
                        InputProps={{
                            style: {
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                width: '250px',
                            },
                        }}
                    />
                    <Button
                        variant="outlined"
                        style={{ borderColor: '#FF9201', color: "#fff" }}
                        onClick={handleJoinClick}
                    >
                        Join
                    </Button>
                </Box>
                {/* Error Message */}
                {error && <Typography color="white">{error}</Typography>}
            </Container>
        </div>
    );
};

export default QuizCode;

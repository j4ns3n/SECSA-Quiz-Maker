import React, { useState } from 'react';
import { AppBar, Toolbar, Button, TextField, Container, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import LogoSecsa from '../assets/secsalogo.png';

const QuizApp = () => {
    const [quizCode, setQuizCode] = useState('');
    const [error, setError] = useState('');
    const [userName, setUserName] = useState('');
    const [userCourse, setUserCourse] = useState('');
    const [quizData, setQuizData] = useState(null); // Store quiz data once fetched
    const navigate = useNavigate(); // Initialize navigate

    const handleJoinClick = async () => {
        try {
            const response = await fetch(`/api/exams/${quizCode}`);

            if (!response.ok) {
                throw new Error('Quiz not found, please check the code.');
            }
            const data = await response.json();

            if (data) {
                setQuizData(data); // Store the quiz data in state
                setError('');
            } else {
                setError('Quiz not found, please check the code.');
            }
        } catch (err) {
            console.error(err);
            setError('Quiz not found, please check the code.');
        }
    };

    const handleSubmit = () => {
        if (userName && userCourse && quizData) {
            const userData = {
                name: userName,
                course: userCourse,
            };

            // Pass both quiz data and user data as state to the quiz page
            navigate(`/exam/${quizData.title}`, { state: { quizData, userData } });
        } else {
            setError('Please enter both your name and course.');
        }
    };

    return (
        <div style={{
            height: '100vh',
            background: 'linear-gradient(to bottom, #FF9201, #ffD181)',
            color: '#fff'
        }}>
            <AppBar position="static" style={{ backgroundColor: '#FF9201' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <img src={LogoSecsa} alt="logo" style={{ height: '40px' }} />
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '15vh' }}>
                <Typography variant="h3" style={{ marginBottom: '50px', fontWeight: 'bold' }}>
                    SECSA Quiz Maker
                </Typography>

                {/* Render the quiz code input only if quiz data is not fetched */}
                {!quizData && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, padding: '20px' }}>
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
                            style={{ backgroundColor: '#FF9201', color: "#fff" }}
                            onClick={handleJoinClick}
                        >
                            Join
                        </Button>
                    </Box>
                )}

                {/* Error Message */}
                {error && <Typography color="white">{error}</Typography>}

                {/* User Input Form */}
                {quizData && (
                    <div style={{ marginTop: '20px' }}>
                        <Typography variant="h5" style={{ marginBottom: '20px' }}>
                            Please enter your details
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                            <TextField
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                variant="outlined"
                                placeholder="Your Name"
                                InputProps={{
                                    style: {
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        width: '250px',
                                    },
                                }}
                            />
                            <TextField
                                value={userCourse}
                                onChange={(e) => setUserCourse(e.target.value)}
                                variant="outlined"
                                placeholder="Your Course"
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
                                style={{ backgroundColor: '#FF9201', color: "#fff", marginTop: '20px' }}
                                onClick={handleSubmit}
                            >
                                Start
                            </Button>
                        </Box>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default QuizApp;

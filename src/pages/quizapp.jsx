import React, { useState } from 'react';
import { AppBar, Toolbar, Button, TextField, Container, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import LogoSecsa from '../assets/secsalogo.png';

const QuizApp = () => {
    const [quizCode, setQuizCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Initialize navigate

    const handleJoinClick = async () => {
        try {
            const response = await fetch(`/api/exams/${quizCode}`);

            if (!response.ok) {
                throw new Error('Quiz not found, please check the code.');
            }
            const data = await response.json();

            if (data) {
                navigate(`/quiz/${data.title}`, { state: { quizData: data } });
            } else {
                setError('Quiz not found, please check the code.');
            }
        } catch (err) {
            console.error(err);
            setError('Server error. Please try again later.');
        }
    };

    return (
        <div style={{
            height: '100vh',
            background: 'linear-gradient(to bottom, #893200, #ff9b61)',
            color: '#fff'
        }}>
            <AppBar position="static" style={{ backgroundColor: '#914214' }}>
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
                        style={{ backgroundColor: '#914214', color: "#fff" }}
                        onClick={handleJoinClick}
                    >
                        Join
                    </Button>
                </Box>
                {error && <Typography color="error">{error}</Typography>} 
            </Container>
        </div>
    );
}

export default QuizApp;

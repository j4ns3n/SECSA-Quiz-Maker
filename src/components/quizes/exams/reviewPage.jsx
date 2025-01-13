import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Button,
    Typography,
    Card,
    CardContent,
    IconButton
} from '@mui/material';
import LogoSecsa from '../../../assets/secsalogo.png';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const ReviewPage = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [hover, setHover] = useState(false);
    const navigate = useNavigate();
    const { exam } = useLocation().state || {};

    console.log(exam);
    const handleLogout = React.useCallback(() => {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/login', { replace: true });
    }, [navigate]);

    const questions = exam?.questions || [];

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
        }
    };

    const handleBack = async () => {
        navigate('/exam/recent-exams');
    }


    return (
        <div
            style={{
                height: '100vh',
                background: 'linear-gradient(to top, #ffdc75, #d37900, #a54e00)',
                color: '#fff'
            }}
        >
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
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 'calc(100vh - 64px)',
                    width: '100%',
                    overflow: 'hidden',
                }}
            >
                <Card
                    sx={{
                        width: '600px',
                        padding: 3,
                        borderRadius: 3,
                        backgroundColor: '#fff',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
                        maxHeight: '90%',
                        overflowY: 'auto',
                    }}
                >
                    <IconButton sx={{ padding: 0 }} onClick={handleBack}><ArrowBackIcon sx={{ color: '#black' }} /></IconButton>
                    <CardContent>
                        <Typography variant="h4" gutterBottom align="center">
                            {exam?.examTitle || 'No Exam Title'}
                        </Typography>
                        <Typography variant="h6" gutterBottom align="center">
                            {exam?.course || 'No Course Provided'}
                        </Typography>

                        {questions.length > 0 && (
                            <div style={{ marginTop: '50px' }}>
                                <Typography variant="h7">
                                    <strong>{currentQuestionIndex + 1}. </strong>{`${questions[currentQuestionIndex].question}`}
                                </Typography>
                                <Typography sx={{ marginTop: '30px' }}>
                                    <strong>Your Answer: </strong>{questions[currentQuestionIndex].userAnswer}
                                </Typography>
                                <Typography sx={{ marginTop: '30px' }}>
                                    <strong style={{ color: '#008000' }}>Correct Answer: </strong>{questions[currentQuestionIndex].correctAnswer}
                                </Typography>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '150px' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handlePreviousQuestion}
                                disabled={currentQuestionIndex === 0}
                                sx={{ backgroundColor: '#e05707' }}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNextQuestion}
                                disabled={currentQuestionIndex === questions.length - 1}
                                sx={{ backgroundColor: '#e05707' }}
                            >
                                Next
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ReviewPage
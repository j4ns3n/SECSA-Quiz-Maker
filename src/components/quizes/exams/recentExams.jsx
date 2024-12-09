import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Typography, Table, TableHead, TableBody, TableRow, TableCell, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoSecsa from '../../../assets/secsalogo.png';
import LogoutIcon from '@mui/icons-material/Logout';
import { jwtDecode } from 'jwt-decode';

const RecentExams = () => {
    const [hover, setHover] = useState(false);
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("authToken");
            try {
                const response = await fetch(`/api/user/${jwtDecode(token).id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to retrieve user');
                }

                const responseData = await response.json();
                setExams(responseData.user.exams);
            } catch (error) {
                console.error('ERROR:', error);
            }
        };

        fetchUserData(); // Call the async function
    }, []);

    const handleLogout = React.useCallback(() => {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/login', { replace: true });
    }, [navigate]);

    // const handleBack = async () => {
    //     navigate('/exam');
    // }

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

            <Box sx={{
                width: '80%',
                margin: '0 auto',
                padding: 2,
                marginTop: 4,
                overflow: 'hidden',
                justifyContent: 'center'
            }}>
                <Typography variant="h5">{'Recent Exam(s)'}</Typography>
                <br />
                <Paper>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Exam Title</TableCell>
                                <TableCell>Exam Code</TableCell>
                                <TableCell>Course</TableCell>
                                <TableCell>Exam Date</TableCell>
                                <TableCell>Score</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {exams.length > 0 ? exams.map((exam, index) => (
                                <TableRow key={index}>
                                    <TableCell>{exam.examTitle}</TableCell>
                                    <TableCell>{exam.code}</TableCell>
                                    <TableCell>{exam.course}</TableCell>
                                    <TableCell>{formatDate(exam.createdAt)}</TableCell> {/* Adjust field names as per your response */}
                                    <TableCell>{exam.score}</TableCell> {/* Adjust field names as per your response */}
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4}>No exams available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Paper>
            </Box>
        </div>
    )
}

export default RecentExams
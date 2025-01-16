import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Typography, Table, TableHead, TableBody, TableRow, TableCell, Paper, Box, TablePagination, IconButton, TableContainer } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoSecsa from '../../../assets/secsalogo.png';
import LogoutIcon from '@mui/icons-material/Logout';
import { jwtDecode } from 'jwt-decode';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import scbackground from '../../../assets/sbbg.png';

const RecentExams = () => {
    const [hover, setHover] = useState(false);
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

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
                console.log(responseData)
            } catch (error) {
                console.error('ERROR:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = React.useCallback(() => {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/login', { replace: true });
    }, [navigate]);

    // const handleBack = async () => {
    //     navigate('/exam');
    // }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 15));
        setPage(0);
    };

    const examsToDisplay = exams.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleBack = async () => {
        navigate('/exam');
    }

    const handleReviewPage = async (exam) => {
        navigate('/exam/recent-exams/review', { state: { exam } });
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

            <Box sx={{
                width: '80%',
                margin: '0 auto',
                padding: 2,
                marginTop: 4,
                overflow: 'hidden',
                justifyContent: 'center'
            }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <IconButton sx={{ padding: 0 }}><ArrowBackIcon onClick={handleBack} sx={{ color: '#FFFF' }} /></IconButton>
                    <Typography variant="h5">{'Recent Exam(s)'}</Typography>
                </Box>
                <br />
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>No.</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Exam Title</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Exam Code</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Course</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Exam Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {examsToDisplay.length > 0 ? (
                                examsToDisplay.map((exam, index) => (
                                    <TableRow key={exam._id}>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>{exam.examTitle}</TableCell>
                                        <TableCell>{exam.code}</TableCell>
                                        <TableCell sx={{ width: '250px' }}>{exam.course}</TableCell>
                                        <TableCell sx={{ width: '250px' }}>{formatDate(exam.createdAt)}</TableCell>
                                        <TableCell>{exam.score} / {exam.questions.length}</TableCell>
                                        <TableCell align="center">
                                            <IconButton onClick={() => handleReviewPage(exam)}>
                                                <RemoveRedEyeIcon sx={{ cursor: 'pointer' }} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow >
                                    <TableCell colSpan={4}>No exam(s) available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={exams.length}  // Total number of exams
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>
            </Box>
        </div>
    )
}

export default RecentExams
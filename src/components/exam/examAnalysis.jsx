import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, IconButton, Modal, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const ExamAnalysis = ({ exam, onBack }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalData, setModalData] = useState([]);
    const handleOpenModal = (title, data) => {
        console.log(data);
        setModalTitle(title);
        setModalData(data);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };
    let allQuestions = exam.topics.flatMap((topic) => [
        ...topic.selectedQuestions.easy.map((question) => ({
            ...question,
            difficulty: 'Easy',
        })),
        ...topic.selectedQuestions.intermediate.map((question) => ({
            ...question,
            difficulty: 'Intermediate',
        })),
        ...topic.selectedQuestions.difficult.map((question) => ({
            ...question,
            difficulty: 'Difficult',
        })),
    ]);


    let questionStats = allQuestions.reduce((acc, question) => {
        acc[question.questionText] = {
            correct: 0,
            wrong: 0,
            correctParticipants: [],
            wrongParticipants: [],
            type: question.type,
            difficulty: question.difficulty
        };
        return acc;
    }, {});

    exam.participants.forEach((participant) => {
        participant.questions.forEach((participantAnswer) => {
            const matchedQuestion = allQuestions.find(
                (question) => question.questionText === participantAnswer.question
            );

            if (matchedQuestion) {
                if (matchedQuestion.answer === participantAnswer.userAnswer) {
                    questionStats[matchedQuestion.questionText].correct += 1;
                    questionStats[matchedQuestion.questionText].correctParticipants.push(participant.name);
                } else {
                    questionStats[matchedQuestion.questionText].wrong += 1;
                    questionStats[matchedQuestion.questionText].wrongParticipants.push(participant.name);
                }
            }
        });
    });


    const questionRows = Object.keys(questionStats).map((questionText, index) => (
        {
            no: index + 1,
            questionText,
            correctParticipants: questionStats[questionText].correctParticipants.length,
            countCorrectParticipants: questionStats[questionText].correctParticipants,
            wrongParticipants: questionStats[questionText].wrongParticipants.length,
            countWrongParticipants: questionStats[questionText].wrongParticipants,
            difficulty: questionStats[questionText].difficulty,
            type: questionStats[questionText].type,
        }));


    const totalQuestions = exam.totalQuestions;

    let passed = 0;
    let failed = 0;
    const passedStudents = [];
    const failedStudents = [];

    exam.participants.forEach((participant) => {
        const { score } = participant;
        const percentage = (score / totalQuestions) * 100;

        if (percentage >= 50) {
            passed += 1;
            passedStudents.push({ name: participant.name, score: score });
        } else {
            failed += 1;
            failedStudents.push({ name: participant.name, score: score });
        }
    });

    const scoreDistribution = [
        { name: 'Passed', value: passed },
        { name: 'Failed', value: failed },
    ];

    const COLORS = ['#00C49F', '#FF8042'];

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const displayedQuestions = questionRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handlePieChartClick = (data, index) => {
        if (index === 0) {
            handleOpenModal('Students who Passed', passedStudents);
        } else {
            handleOpenModal('Students who Failed', failedStudents);
        }
    };

    return (
        <>
            <Typography variant="h5"><IconButton onClick={onBack} sx={{ marginBottom: '4px' }}> <ArrowBackIcon /></IconButton>Exam Results for {exam.title}</Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
                {passed} Passed | {failed} Failed
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={scoreDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        onClick={handlePieChartClick}
                    >
                        {scoreDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
            <br />
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>No.</TableCell>
                            <TableCell>Question</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Difficulty</TableCell>
                            <TableCell align="center">Correct Answers</TableCell>
                            <TableCell align="center">Wrong Answers</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedQuestions.map((question, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell align="center" sx={{ width: '300px' }}>{question.questionText}</TableCell>
                                <TableCell align="center">{question.type}</TableCell>
                                <TableCell align="center">{question.difficulty}</TableCell>
                                <TableCell
                                    align="center"
                                    style={{ cursor: 'pointer', color: 'green' }}
                                    onClick={() =>
                                        handleOpenModal('Correct Answers', question.countCorrectParticipants)
                                    }
                                >{question.correctParticipants}</TableCell>
                                <TableCell
                                    align="center"
                                    style={{ cursor: 'pointer', color: 'red' }}
                                    onClick={() =>
                                        handleOpenModal('Wrong Answers', question.countWrongParticipants)
                                    }
                                >{question.wrongParticipants}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={allQuestions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Modal open={modalOpen} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        height: 500, // Fixed height
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        overflowY: 'auto', // Scrollable content
                    }}
                >
                    <Typography variant="h6" component="h2" gutterBottom>
                        {modalTitle}
                    </Typography>
                    {modalData.length > 0 ? (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student Name</TableCell>
                                    <TableCell>Score</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {modalData.map((student, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <strong>{index + 1}.</strong> {student.name}
                                        </TableCell>
                                        <TableCell>
                                            <strong>{student.score}</strong>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Typography
                            variant="body1"
                            color="textSecondary"
                            sx={{ textAlign: 'center', marginTop: '20px' }}
                        >
                            No students to display.
                        </Typography>
                    )}
                </Box>
            </Modal>
        </>
    );
};

export default ExamAnalysis;

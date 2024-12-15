import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const ExamAnalysis = ({ exam, onBack }) => {
    const totalQuestions = exam.totalQuestions;

    let passed = 0;
    let failed = 0;

    exam.participants.forEach((participant) => {
        const { score } = participant;
        const percentage = (score / totalQuestions) * 100;

        if (percentage >= 50) {
            passed += 1;
        } else {
            failed += 1;
        }
    });

    const scoreDistribution = [
        { name: 'Passed', value: passed },
        { name: 'Failed', value: failed },
    ];

    const COLORS = ['#00C49F', '#FF8042'];


    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedParticipants = exam.participants.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
                            <TableCell sx={{ fontWeight: 'bold' }}>No.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Course</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedParticipants.map((participant, index) => {
                            const { score, name, course } = participant;
                            return (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{name}</TableCell>
                                    <TableCell>{course}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{score}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={exam.participants.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </>
    );
};

export default ExamAnalysis;

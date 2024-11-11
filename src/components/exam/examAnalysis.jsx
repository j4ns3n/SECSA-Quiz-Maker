import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography } from '@mui/material';

// ExamAnalysis component
const ExamAnalysis = ( examData ) => {
    const exam = examData.exam;
    const totalQuestions = exam.totalQuestions;

    // Variables to count passed and failed participants
    let passed = 0;
    let failed = 0;

    // Process participant data to calculate pass/fail counts
    exam.participants.forEach((participant) => {
        const { score } = participant;
        const percentage = (score / totalQuestions) * 100;

        // Passing criteria: 50% or more
        if (percentage >= 50) {
            passed += 1;
        } else {
            failed += 1;
        }
    });

    // Score distribution for pie chart
    const scoreDistribution = [
        { name: 'Passed', value: passed },
        { name: 'Failed', value: failed },
    ];

    // Custom colors for the pie chart slices
    const COLORS = ['#00C49F', '#FF8042']; // Green for Passed, Red for Failed

    return (
        <>
            <Typography variant="h5">Exam Results for {exam.title}</Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
                {passed} Participants Passed | {failed} Participants Failed
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={scoreDistribution}
                        cx="50%" // center the pie chart horizontally
                        cy="50%" // center the pie chart vertically
                        innerRadius={50} // size of the inner radius for a donut chart
                        outerRadius={100} // size of the outer radius for the pie chart
                        fill="#8884d8"
                        dataKey="value" // the key to map each segment of the pie
                    >
                        {scoreDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </>
    );
};

export default ExamAnalysis;

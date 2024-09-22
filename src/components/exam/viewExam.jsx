import React, { useEffect, useState } from 'react';
import { useExamContext } from '../../hooks/useExamContext';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { red } from '@mui/material/colors';
import { Document, Packer, Paragraph, TextRun } from 'docx'; 
import { saveAs } from 'file-saver'; 

const ViewExam = () => {
  const { exams, dispatch } = useExamContext();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await fetch('/api/exams');
        if (!response.ok) {
          throw new Error('Failed to fetch exams');
        }
        const json = await response.json();
        dispatch({ type: 'SET_EXAM', payload: json });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchExam();
  }, [dispatch]);

  const handleViewExam = async (exam) => {
    console.log('Exam Data:', exam); 

    if (!exam.topics || exam.topics.length === 0) {
      console.error('No topics available');
      return;
    }

    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
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

    const shuffledQuestions = shuffleArray(allQuestions);

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: exam.title.toUpperCase(),
                  bold: true,
                  size: 36,
                  allCaps: true,
                }),
              ],
              alignment: 'center',
              spacing: { after: 400 },
            }),

            // Course, Subject, and Year Level
            new Paragraph({
              text: `Course: ${exam.course}`,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: `Subject: ${exam.subject}`,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: `Year Level: ${exam.yearLevel}`,
              spacing: { after: 400 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Instructions:",
                  bold: true,
                  underline: true,
                  size: 28,
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: "I. Answer all questions.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "II. Write your answers clearly in the space provided.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "III. Marks are indicated next to each question.",
              spacing: { after: 400 },
            }),

            // Render the shuffled questions based on their type
            ...shuffledQuestions.flatMap((question, questionIndex) => {
              const questionText = new Paragraph({
                children: [
                  new TextRun({
                    text: `${questionIndex + 1}. ${question.questionText}`,
                    size: 24,
                  }),
                ],
                spacing: { after: 200 },
              });

              // Handle different question types
              let questionDetails = [];
              if (question.type === 'Multiple Choice') {
                // Render multiple choice options
                questionDetails = question.choices.map((choice, index) => {
                  return new Paragraph({
                    text: `${String.fromCharCode(65 + index)}. ${choice}`,
                    spacing: { after: 100 },
                  });
                });
              } else if (question.type === 'True or False') {
                // Render true/false options
                questionDetails = [
                  new Paragraph({
                    text: "A. True",
                    spacing: { after: 100 },
                  }),
                  new Paragraph({
                    text: "B. False",
                    spacing: { after: 100 },
                  }),
                ];
              } else if (question.type === 'Identification') {
                // Render identification question with blank space for the answer
                questionDetails = [
                  new Paragraph({
                    text: "Answer: _____________________________________________",
                    spacing: { after: 100 },
                  }),
                ];
              }

              // Add spacing after each question
              return [
                questionText,
                ...questionDetails,
                new Paragraph({
                  spacing: { after: 100 },
                }),
              ];
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${exam.title}-TestPaper.docx`);
  };




  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <br /><br />
      <Typography variant="h5" gutterBottom>List of Exams</Typography><br /><br />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No.</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams && exams.length > 0 ? (
              exams.map((exam, index) => (
                <TableRow key={exam._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{exam.title}</TableCell>
                  <TableCell>{exam.course}</TableCell>
                  <TableCell>
                    <IconButton>
                      <DeleteIcon sx={{ color: red[900] }} />
                    </IconButton>
                    <IconButton onClick={() => handleViewExam(exam)}>
                      <DownloadIcon sx={{ cursor: 'pointer' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No exams available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ViewExam;

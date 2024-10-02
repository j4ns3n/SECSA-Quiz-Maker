import React, { useEffect, useState } from 'react';
import { useExamContext } from '../../hooks/useExamContext';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, IconButton, Typography, TablePagination,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { red } from '@mui/material/colors';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const ViewExam = () => {
  const { exams, dispatch } = useExamContext();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [alerts, setAlerts] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [examId, setExamId] = useState('');

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

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

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

  const handleDeleteExam = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete exam');
      }

      dispatch({ type: 'DELETE_EXAM', payload: examId });

      setAlerts({ open: true, message: 'Exam deleted successfully!', severity: 'success' });
      setOpenDialog(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const handleSnackbarClose = () => {
    setAlerts(false);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Warning!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this Exam?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>No</Button>
          <Button onClick={handleDeleteExam} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
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
              exams.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((exam, index) => (
                <TableRow key={exam._id}>
                  <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                  <TableCell>{exam.title}</TableCell>
                  <TableCell>{exam.course}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => {setExamId(exam._id); setOpenDialog(true);}}>
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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={exams.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Snackbar open={alerts.open} autoHideDuration={2000} onClose={handleSnackbarClose}>
        <Alert
          onClose={handleSnackbarClose}
          severity={alerts.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          Exam deleted successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ViewExam;

import React, { useEffect, useState } from 'react';
import { useExamContext } from '../../hooks/useExamContext';
import {
  Table as MUITable,
  TableBody,
  TableCell as MUITableCell,
  TableContainer,
  TableHead,
  TableRow as MUITableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Typography,
  TablePagination,
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

import { Document, Packer, Paragraph, Table as DocxTable, TableCell as DocxTableCell, TableRow as DocxTableRow, TextRun } from 'docx';
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
            // Institution Details
            new Paragraph({
              children: [
                new TextRun({
                  text: `${exam.course}`,
                  alignment: 'left',
                  bold: true,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "School of Engineering, Computer Studies and Architecture",
              alignment: 'left',
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "Southland College, Kabankalan City, Negros Occidental",
              alignment: 'left',
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "______________________________________________________________________________________",
                  alignment: 'center',
                  bold: true,
                }),
              ],
              spacing: { after: 400 }
            }),

            new Paragraph({
              text: `${exam.title}`,
              alignment: 'left',
              bold: true,
              spacing: { after: 100 },
            }),

            // "Building the future. Building it right."
            new Paragraph({
              children: [
                new TextRun({
                  text: '"Building the future. Building it right."',
                  italics: true,
                })
              ],
              alignment: 'left',
              spacing: { after: 400 },
            }),

            // Name
            new Paragraph({

              children: [
                new TextRun({
                  text: "Name:___________________________________    Course & Year: _________    Date: _________",
                  alignment: 'left',
                  bold: true,
                }),
              ],
              spacing: { after: 300 },
            }),

            new Paragraph({

              children: [
                new TextRun({
                  text: "General Instructions:",
                  alignment: 'left',
                  bold: true,
                }),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: "Cheating, either caught-in-the-act or discovered to have committed such action after the examination, shall be subject to proper disciplinary action and penalty as stipulated under the Southland College Student Manual. Cheating is identified as any of the following forms, any student who:",
              alignment: 'justify',
              spacing: { after: 300 },
            }),
            new Paragraph({
              text: "1. Deliberately looks at another student’s examination paper.",
              alignment: 'left',
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "2. Talks or communicates with another student.",
              alignment: 'left',
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "3. Copies from another student’s examination paper or report.",
              alignment: 'left',
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "4. Sends another student to take the examination/course/class requirement.",
              alignment: 'left',
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "5. Renders or being an accessory to such aid.",
              alignment: 'left',
              spacing: { after: 500 },
            }),

            // Questions
            ...shuffledQuestions.flatMap((question, questionIndex) => {
              const questionText = new Paragraph({
                children: [
                  new TextRun({
                    text: `${questionIndex + 1}. ${question.questionText}`,
                    size: 20,
                  }),
                ],
                spacing: { after: 150 },
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
                  new Paragraph({ text: "True", spacing: { after: 100 } }),
                  new Paragraph({ text: "False", spacing: { after: 100 } }),
                ];
              } else if (question.type === 'Identification') {
                // Render identification question with blank space for the answer
                questionDetails = [new Paragraph({ text: "Answer: ", spacing: { after: 100 } })];
              } else if (question.type === 'Essay') {
                questionDetails = [new Paragraph({ text: "Answer: ", spacing: { after: 500 } })];
              } else if (question.type === 'Worded Problem') {
                questionDetails = [new Paragraph({ text: "Answer: ", spacing: { after: 100 } })];
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
        <MUITable>
          <TableHead>
            <MUITableRow>
              <MUITableCell sx={{ fontWeight: 'bold' }}>No.</MUITableCell>
              <MUITableCell sx={{ fontWeight: 'bold' }}>Title</MUITableCell>
              <MUITableCell sx={{ fontWeight: 'bold' }}>Course</MUITableCell>
              <MUITableCell sx={{ fontWeight: 'bold' }}>Code</MUITableCell>
              <MUITableCell align="center" sx={{ fontWeight: 'bold' }}>Action</MUITableCell>
            </MUITableRow>
          </TableHead>
          <TableBody>
            {exams && exams.length > 0 ? (
              exams.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((exam, index) => (
                <MUITableRow key={exam._id}>
                  <MUITableCell>{index + 1 + page * rowsPerPage}</MUITableCell>
                  <MUITableCell>{exam.title}</MUITableCell>
                  <MUITableCell>{exam.course}</MUITableCell>
                  <MUITableCell>{exam.examCode}</MUITableCell>
                  <MUITableCell align="center">
                    <IconButton onClick={() => handleViewExam(exam)}>
                      <DownloadIcon sx={{ cursor: 'pointer' }} />
                    </IconButton>
                    <IconButton onClick={() => { setExamId(exam._id); setOpenDialog(true); }}>
                      <DeleteIcon sx={{ color: red[900] }} />
                    </IconButton>
                  </MUITableCell>
                </MUITableRow>
              ))
            ) : (
              <MUITableRow>
                <MUITableCell colSpan={4} align="center">
                  No exams available.
                </MUITableCell>
              </MUITableRow>
            )}
          </TableBody>
        </MUITable>
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

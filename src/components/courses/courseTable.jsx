import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { orange, blue, red } from '@mui/material/colors';
import TopicsTable from './topicsTable';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const CourseTable = ({ course, onBack }) => {
  const [selectedYearSubjects, setSelectedYearSubjects] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formValues, setFormValues] = useState({ subjectCode: '', subjectName: '', topics: [] });
  const [editingSubject, setEditingSubject] = useState(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  
  const openDialogBox = (questionId) => {
    setSubjectId(questionId);
    setOpenDialog(true);
};


  const closeDialogBox = () => {
    setOpenDialog(false);
  };

  const handleChange = (event) => {
    const selectedYearLevel = event.target.value;
    setSelectedYear(selectedYearLevel);

    const yearLevel = course.yearLevels.find((level) => level.year === selectedYearLevel);
    if (yearLevel) {
      setSelectedYearSubjects(yearLevel.subjects || []);
    } else {
      setSelectedYearSubjects([]);
    }
  };

  const handleViewTopics = (subject) => {
    setSelectedSubject(subject);
  };

  const handleBackToSubjects = (updatedSubject) => {
    if (updatedSubject) {
      setSelectedYearSubjects((prevSubjects) =>
        prevSubjects.map((sub) =>
          sub._id === updatedSubject._id
            ? { ...sub, topics: updatedSubject.topics }
            : sub
        )
      );
    }
    setSelectedSubject(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  // Add New Subject
  const handleAddSubject = async () => {
    try {
      const response = await fetch(`/api/courses/${course._id}/year/${selectedYear}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectCode: formValues.subjectCode,
          subjectName: formValues.subjectName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add subject');
      }

      const updatedSubjects = await response.json();
      setSelectedYearSubjects(updatedSubjects);
      resetForm();
      // Show success Snackbar
      setSnackbarMessage('Subject added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error(error);
      // Show error Snackbar
      setSnackbarMessage('Failed to add subject.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleUpdateSubject = async () => {
    try {
      const response = await fetch(
        `/api/courses/${course._id}/year/${selectedYear}/subject/${editingSubject._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subjectCode: formValues.subjectCode,
            subjectName: formValues.subjectName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update subject');
      }

      const updatedSubjects = await response.json();
      setSelectedYearSubjects(updatedSubjects);
      resetForm();
      // Show success Snackbar
      setSnackbarMessage('Subject updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error(error);
      // Show error Snackbar
      setSnackbarMessage('Failed to update subject.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteSubject = async () => {
    try {
      const response = await fetch(`/api/courses/${course._id}/year/${selectedYear}/subject/${subjectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete subject');
      }

      setSelectedYearSubjects((prevSubjects) => prevSubjects.filter((subject) => subject._id !== subjectId));
      // Show success Snackbar
      setSnackbarMessage('Subject deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpenDialog(false);
    } catch (error) {
      console.error(error);
      // Show error Snackbar
      setSnackbarMessage('Failed to delete subject.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const resetForm = () => {
    setFormValues({ subjectCode: '', subjectName: '', topics: [] });
    setEditingSubject(null);
  };

  const handleEditSubject = (subject) => {
    setFormValues({ subjectCode: subject.subjectCode, subjectName: subject.subjectName });
    setEditingSubject(subject);
  };

  return (
    <Box>
      {selectedSubject ? (
        <TopicsTable
          subject={selectedSubject}
          courseId={course._id}
          selectedYearLevel={selectedYear}
          onBack={handleBackToSubjects}
        />
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            <br />
            {course?.desc}
            <br />
            <br />
            <FormControl style={{ width: '250px' }}>
              <InputLabel id="year-level-select-label">Year Level</InputLabel>
              <Select
                labelId="year-level-select-label"
                id="year-level-select"
                value={selectedYear}
                label="Year Level"
                onChange={handleChange}
              >
                {course.yearLevels.map((yearLevel) => (
                  <MenuItem key={yearLevel._id} value={yearLevel.year}>
                    {yearLevel.year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <br />
            <br />
          </Typography>

          {selectedYear && (
            <Typography variant="h5" gutterBottom style={{ textTransform: 'uppercase' }}>
              SUBJECTS FOR {selectedYear}
            </Typography>
          )}
          <br />

          {selectedYear && (
            <Box>
              <TextField
                name="subjectCode"
                label="Subject Code"
                type="text"
                variant="outlined"
                size="small"
                sx={{ mr: 2 }}
                value={formValues.subjectCode}
                onChange={handleInputChange}
              />
              <TextField
                name="subjectName"
                label="Subject Name"
                type="text"
                variant="outlined"
                size="small"
                value={formValues.subjectName}
                onChange={handleInputChange}
              />
              <Button
                onClick={editingSubject ? handleUpdateSubject : handleAddSubject}
                size="large"
                color="primary"
                variant="outlined"
                sx={{ paddingBottom: '4px', ml: 2 }}
              >
                {editingSubject ? 'Save' : 'Add'}
              </Button>

              {/* Cancel button appears only in edit mode */}
              {editingSubject && (
                <Button
                  onClick={resetForm}
                  size="large"
                  color="error"
                  variant="outlined"
                  sx={{ paddingBottom: '4px', ml: 2 }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          )}
          <br />
          <br />
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="course table">
              <TableHead>
                <TableRow sx={{ color: orange }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>No.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Subject Code</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Topics</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedYearSubjects.length > 0 ? (
                  selectedYearSubjects.map((subject, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ maxWidth: 251 }}>{subject.subjectCode}</TableCell>
                      <TableCell>{subject.subjectName}</TableCell>
                      <TableCell>{subject.topics.length}</TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => handleViewTopics(subject)}>
                          <RemoveRedEyeIcon sx={{ cursor: 'pointer' }} />
                        </IconButton>
                        <IconButton onClick={() => handleEditSubject(subject)}>
                          <EditIcon sx={{ color: blue[600] }} />
                        </IconButton>
                        <IconButton onClick={() => openDialogBox(subject._id)}>
                          <DeleteIcon sx={{ color: red[900] }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>No subjects available.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Button onClick={onBack} sx={{ mt: 2 }}>
            Back to Courses
          </Button>
        </>
      )}

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        variant="filled"
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={openDialog}
        onClose={closeDialogBox}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Warning!"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this Subject?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogBox}>No</Button>
          <Button onClick={handleDeleteSubject} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseTable;

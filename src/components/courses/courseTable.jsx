import React, { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
  TablePagination
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
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [errors, setErrors] = useState({
    subjectCode: "",
    subjectName: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Validation function to check required fields
  const validateForm = () => {
    let isValid = true;
    let newErrors = {};

    if (!formValues.subjectCode) {
      newErrors.subjectCode = "Subject Code is required";
      isValid = false;
    }

    if (!formValues.subjectName) {
      newErrors.subjectName = "Subject Name is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };


  const userRole = sessionStorage.getItem('userRole');

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? "" : prevErrors[name],
    }));
  };

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

  // Add New Subject
  const handleAddSubject = async () => {
    if (!validateForm()) {
      return; // Exit if form is not valid
    }

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
      setSnackbarMessage('Subject added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error(error);
      setSnackbarMessage('Failed to add subject.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Update Subject
  const handleUpdateSubject = async () => {
    if (!validateForm()) {
      return; // Exit if form is not valid
    }

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
      setSnackbarMessage('Subject updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error(error);
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
      setSnackbarMessage('Subject deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpenDialog(false);
    } catch (error) {
      console.error(error);
      setSnackbarMessage('Failed to delete subject.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const resetForm = () => {
    setFormValues({ subjectCode: '', subjectName: '', topics: [] });
    setEditingSubject(null);
    setErrors({ subjectCode: "", subjectName: "" }); // Reset errors
  };

  const handleEditSubject = (subject) => {
    setFormValues({ subjectCode: subject.subjectCode, subjectName: subject.subjectName });
    setEditingSubject(subject);
  };


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
            <IconButton sx={{marginBottom: '4px'}} onClick={onBack}> <ArrowBackIcon /></IconButton>{course?.desc}
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
          </Typography>
          <br />
          {selectedYear && userRole === 'admin' && (
            <Box>
              <TextField
                name="subjectCode"
                required
                label="Subject Code"
                type="text"
                variant="outlined"
                size="small"
                sx={{ mr: 2 }}
                value={formValues.subjectCode}
                onChange={handleInputChange}
                error={!!errors.subjectCode}
                helperText={errors.subjectCode}
              />
              <TextField
                name="subjectName"
                required
                label="Subject Name"
                type="text"
                variant="outlined"
                size="small"
                value={formValues.subjectName}
                onChange={handleInputChange}
                error={!!errors.subjectName}
                helperText={errors.subjectName}
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
                  selectedYearSubjects
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Slice the array for pagination
                    .map((subject, index) => (
                      <TableRow key={subject._id}> {/* Use subject._id for a unique key */}
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell> {/* Adjust index for pagination */}
                        <TableCell sx={{ maxWidth: 251 }}>{subject.subjectCode}</TableCell>
                        <TableCell>{subject.subjectName}</TableCell>
                        <TableCell>{subject.topics.length}</TableCell>
                        <TableCell align="center">
                          {userRole === 'admin' ? (
                            <>
                              <IconButton onClick={() => handleViewTopics(subject)}>
                                <RemoveRedEyeIcon sx={{ cursor: 'pointer' }} />
                              </IconButton>
                              <IconButton onClick={() => handleEditSubject(subject)}>
                                <EditIcon sx={{ color: blue[600] }} />
                              </IconButton>
                              <IconButton onClick={() => openDialogBox(subject._id)}>
                                <DeleteIcon sx={{ color: red[900] }} />
                              </IconButton>
                            </>
                          ) : userRole === 'Teacher' ? (
                            <IconButton onClick={() => handleViewTopics(subject)}>
                              <RemoveRedEyeIcon sx={{ cursor: 'pointer' }} />
                            </IconButton>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>No subjects available.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={selectedYearSubjects.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
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
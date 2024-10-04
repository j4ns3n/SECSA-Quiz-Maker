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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { orange } from '@mui/material/colors';
import TopicsTable from './topicsTable';

const CourseTable = ({ course, onBack }) => {
  const [selectedYearSubjects, setSelectedYearSubjects] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);

  // State for dialog and form inputs
  const [openDialog, setOpenDialog] = useState(false);
  const [formValues, setFormValues] = useState({ subjectCode: '', subjectName: '', topics: [] });

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
      setSelectedYearSubjects(prevSubjects =>
        prevSubjects.map(sub =>
          sub._id === updatedSubject._id
            ? { ...sub, topics: updatedSubject.topics }
            : sub
        )
      );
    }
    setSelectedSubject(null);
  };

  const handleOpenDialog = () => {
    setFormValues({ subjectName: '', subjectCode: '', topics: [] });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

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
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Failed to add subject');
      }

      const updatedSubjects = await response.json();

      setSelectedYearSubjects(updatedSubjects); 
      handleCloseDialog();
    } catch (error) {
      console.error(error);
    }
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
            <FormControl style={{ width: "250px" }}>
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

          {/* Show the Add Subject button only when a year level is selected */}
          {selectedYear && (
            <Button variant="outlined" onClick={handleOpenDialog}>
              Add Subject
            </Button>
          )}
          <br />
          <br />
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="course table">
              <TableHead>
                <TableRow sx={{ color: orange }}>
                  <TableCell>No.</TableCell>
                  <TableCell>Subject Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Topics</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedYearSubjects.length > 0 ? (
                  selectedYearSubjects.map((subject, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ maxWidth: 251 }}>{subject.subjectName}</TableCell>
                      <TableCell>{subject.desc}</TableCell>
                      <TableCell>{subject.topics.length}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleViewTopics(subject)}>
                          <RemoveRedEyeIcon
                            sx={{ cursor: 'pointer' }}
                          />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>Please Select year level</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Button onClick={onBack} sx={{ mt: 2 }}>
            Back to Courses
          </Button>

          {/* Dialog for Adding Subjects */}
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Add Subject</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                name="subjectCode"
                label="Subject Code"
                type="text"
                fullWidth
                variant="outlined"
                value={formValues.subjectCode}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="subjectName"
                label="Subject Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formValues.subjectName}
                onChange={handleInputChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Cancel
              </Button>
              <Button onClick={handleAddSubject} color="primary">
                Add
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default CourseTable;

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
    IconButton,
    TextField,
    MenuItem,
    InputLabel,
    Select,
    RadioGroup,
    FormControlLabel,
    Radio,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TablePagination
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { blue, red } from '@mui/material/colors';
import FormControl from '@mui/material/FormControl';

const QuestionTable = ({ topic, subjectName, courseId, selectedYearLevel, onBackToTopics, onUpdateQuestions }) => {
    const [difficulty, setDifficulty] = useState('');
    const [open, setOpen] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);
    const [deleteSnack, setDeleteSnack] = useState(false);
    const [type, setType] = useState('');
    const [question, setQuestion] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [choices, setChoices] = useState({
        choice1: '',
        choice2: '',
        choice3: '',
        choice4: ''
    });
    const [filteredDifficulty, setFilteredDifficulty] = useState('');
    const [filteredType, setFilteredType] = useState('');
    const [filteredQuestions, setFilteredQuestions] = useState(topic.questions || []);
    const [questions, setQuestions] = useState(topic.questions || []);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [questionId, setQuestionId] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [errors, setErrors] = useState({});
    const [wordedProblemAnswer, setWordedProblemAnswer] = useState('');
    const [torAnswer, setTorAnswer] = useState('');
    const [identificationAnswer, setIdentificationAnswer] = useState('');
    const [essayAnswer, setEssayAnswer] = useState('');
    const [openAddModal, setOpenAddModal] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleSearchFilter = () => {
        const filtered = questions.filter((q) => {
            // Treat "All" or empty string as "match everything"
            const matchesDifficulty = filteredDifficulty && filteredDifficulty !== "All"
                ? q.difficulty === filteredDifficulty
                : true;
            const matchesType = filteredType && filteredType !== "All"
                ? q.type === filteredType
                : true;

            return matchesDifficulty && matchesType;
        });

        setFilteredQuestions(filtered);
        setPage(0); // Reset to the first page
    };


    const resetSearchFilter = () => {
        setFilteredDifficulty('');
        setFilteredType('');
        setFilteredQuestions(questions); // Reset to all questions
    };

    const handleChangeDifficultyFilter = (event) => {
        setFilteredDifficulty(event.target.value);
    };

    const handleChangeTypeFilter = (event) => {
        setFilteredType(event.target.value);
    };

    const validateForm = () => {
        let formErrors = {};
        if (!difficulty) formErrors.difficulty = 'Please select a difficulty level.';
        if (!type) formErrors.type = 'Please select a question type.';
        if (!question) formErrors.question = 'Please enter a question.';

        if (type === 'Multiple Choice') {
            if (!choices.choice1 || !choices.choice2 || !choices.choice3 || !choices.choice4) {
                formErrors.choices = 'Please fill all the multiple-choice options.';
            }
            if (!correctAnswer) formErrors.correctAnswer = 'Please select the correct answer.';
        }

        if (type === 'True or False' && !torAnswer) {
            formErrors.correctAnswer = 'Please select True or False.';
        }

        if (type === 'Identification' && !identificationAnswer) {
            formErrors.correctAnswer = 'Please provide an answer.';
        }

        if (type === 'Worded Problem' && !wordedProblemAnswer) {
            formErrors.wordedProblemAnswer = 'Please provide a numeric answer.';
        }

        if (type === 'Essay/Short Answer' && !essayAnswer) {
            formErrors.essayAnswer = 'Please provide an answer.';
        }

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const openDialogBox = (topicId) => {
        setQuestionId(topicId);
        setOpenDialog(true);
    };

    const closeDialogBox = () => {
        resetForm();
        setOpenDialog(false);
    };


    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
        setOpenAdd(false);
        setDeleteSnack(false);
        resetForm();
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const questionData = {
            type,
            difficulty,
            questionText: question,
            choices: type === 'Multiple Choice' ? Object.values(choices) : '',
            answer:
                type === 'Multiple Choice'
                    ? correctAnswer
                    : type === 'True or False'
                        ? torAnswer
                        : type === 'Identification'
                            ? identificationAnswer
                            : type === 'Worded Problem'
                                ? wordedProblemAnswer
                                : type === 'Essay'
                                    ? essayAnswer
                                    : ''
        };

        try {
            const url = editingQuestion
                ? `/api/courses/${courseId}/year/${selectedYearLevel}/subject/${subjectName}/topics/${topic.topicName}/questions/${editingQuestion._id}`
                : `/api/courses/${courseId}/year/${selectedYearLevel}/subject/${subjectName}/topics/${topic.topicName}/questions`;

            const method = editingQuestion ? 'PATCH' : 'PATCH';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(questionData),
            });

            if (response.ok) {
                const result = await response.json();
                const updatedQuestions = editingQuestion
                    ? questions.map((q) =>
                        q._id === result.updatedQuestion._id ? result.updatedQuestion : q
                    )
                    : [...questions, result.newQuestion];

                setQuestions(updatedQuestions);
                setFilteredQuestions(updatedQuestions);
                onUpdateQuestions(updatedQuestions);

                setSnackbarMessage(editingQuestion ? 'Question updated successfully!' : 'Question added successfully!');
                setSnackbarOpen(true);

                setOpenAddModal(false);
                resetForm(); // Clear the editing state and form
            } else {
                console.error('Failed to save question');
            }
        } catch (err) {
            console.error('Error saving question:', err);
        }
    };

    const deleteQuestion = async () => {
        try {
            const response = await fetch(
                `/api/courses/${courseId}/year/${selectedYearLevel}/subject/${subjectName}/topics/${topic.topicName}/questions/${questionId}`,
                { method: 'DELETE' }
            );

            if (response.ok) {
                const updatedQuestions = questions.filter((q) => q._id !== questionId);
                setQuestions(updatedQuestions);
                setFilteredQuestions(updatedQuestions);
                onUpdateQuestions(updatedQuestions);

                setDeleteSnack(true);
                setOpenDialog(false);
            } else {
                console.error('Failed to delete question');
                alert('Failed to delete the question. Please try again.');
            }
        } catch (err) {
            console.error('Error deleting question:', err);
            alert('An error occurred while deleting the question.');
        }
    };


    const openEditQuestionModal = (question) => {
        // Populate modal with the question data
        setEditingQuestion(question);
        setDifficulty(question.difficulty);
        setType(question.type);
        setQuestion(question.questionText);

        if (question.type === 'Multiple Choice') {
            setChoices({
                choice1: question.choices[0] || '',
                choice2: question.choices[1] || '',
                choice3: question.choices[2] || '',
                choice4: question.choices[3] || ''
            });
            setCorrectAnswer(question.answer);
        } else if (question.type === 'True or False') {
            setTorAnswer(question.answer);
        } else if (question.type === 'Identification') {
            setIdentificationAnswer(question.answer);
        } else if (question.type === 'Worded Problem') {
            setWordedProblemAnswer(question.answer);
        } else if (question.type === 'Essay') {
            setEssayAnswer(question.answer);
        }

        setOpenAddModal(true); // Open the modal
    };

    const resetForm = () => {
        setQuestion('');
        setChoices({ choice1: '', choice2: '', choice3: '', choice4: '' });
        setCorrectAnswer('');
        setDifficulty('');
        setType('');
        setIdentificationAnswer('');
        setTorAnswer('');
        setWordedProblemAnswer('');
        setEssayAnswer('');
        setEditingQuestion(null);
    };

    const closeAddQuestionModal = () => {
        setOpenAddModal(false);
        resetForm();
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
        setSnackbarMessage('');
    };

    return (
        <Box>
            <Dialog
                open={openDialog}
                onClose={closeDialogBox}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Warning!</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this question?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialogBox} color="primary">
                        No
                    </Button>
                    <Button onClick={deleteQuestion} color="primary" autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={deleteSnack} autoHideDuration={2000} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Question deleted successfully!
                </Alert>
            </Snackbar>

            <br /><br />
            <Typography variant="h5" gutterBottom>
                Questions for {topic.topicName}
            </Typography>
            <br />
            <br />
            <Box display="flex" alignItems="center" mb={2}>
                <FormControl style={{ width: "150px", marginRight: "10px" }}>
                    <InputLabel id="filter-difficulty-label">Filter Difficulty</InputLabel>
                    <Select
                        labelId="filter-difficulty-label"
                        value={filteredDifficulty}
                        onChange={handleChangeDifficultyFilter}
                        label="Filter Difficulty"
                    >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="Easy">Easy</MenuItem>
                        <MenuItem value="Intermediate">Intermediate</MenuItem>
                        <MenuItem value="Difficult">Difficult</MenuItem>
                    </Select>
                </FormControl>

                <FormControl style={{ width: "150px", marginRight: "10px" }}>
                    <InputLabel id="filter-type-label">Filter Type</InputLabel>
                    <Select
                        labelId="filter-type-label"
                        value={filteredType}
                        onChange={handleChangeTypeFilter}
                        label="Filter Type"
                    >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="Multiple Choice">Multiple Choice</MenuItem>
                        <MenuItem value="True or False">True or False</MenuItem>
                        <MenuItem value="Identification">Identification</MenuItem>
                        <MenuItem value="Worded Problem">Worded Problem</MenuItem>
                        <MenuItem value="Essay">Essay</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    onClick={handleSearchFilter}
                    size="large"
                    color="primary"
                    variant="outlined"
                    sx={{ padding: '13px', marginRight: '10px' }}
                >
                    Apply Filters
                </Button>

                <Button
                    size="large"
                    color="primary"
                    variant="outlined"
                    sx={{ padding: '13px' }}
                    onClick={resetSearchFilter}>
                    Reset Filters
                </Button>
            </Box>

            <Button
                size="large"
                color="primary"
                variant="outlined"
                sx={{ padding: '13px', marginBottom: '20px' }}
                onClick={() => setOpenAddModal(true)}
            >
                Add Question
            </Button>

            {/* Questions Table */}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="questions table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>No.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Question</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Difficulty</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredQuestions.length > 0 ? (
                            filteredQuestions
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((question, index) => (
                                    <TableRow key={question._id}>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell sx={{ width: '350px' }}>{question.questionText}</TableCell>
                                        <TableCell>{question.difficulty}</TableCell>
                                        <TableCell>{question.type}</TableCell>
                                        <TableCell align="center">
                                            <IconButton onClick={() => openEditQuestionModal(question)}>
                                                <EditIcon sx={{ color: blue[600] }} />
                                            </IconButton>
                                            <IconButton onClick={() => openDialogBox(question._id)}>
                                                <DeleteIcon sx={{ color: red[900] }} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5}>No questions available</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredQuestions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            <Dialog open={openAddModal} onClose={closeAddQuestionModal} fullWidth maxWidth="sm">
                <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Difficulty</InputLabel>
                        <Select
                            labelId="difficulty-label"
                            label="Difficulty"
                            value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <MenuItem value="Easy">Easy</MenuItem>
                            <MenuItem value="Intermediate">Intermediate</MenuItem>
                            <MenuItem value="Difficult">Difficult</MenuItem>
                        </Select>
                        {errors.difficulty && <Typography color="error">{errors.difficulty}</Typography>}
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Type</InputLabel>
                        <Select
                            labelId="type-label"
                            label="Type"
                            value={type} onChange={(e) => setType(e.target.value)}
                        >
                            <MenuItem value="Multiple Choice">Multiple Choice</MenuItem>
                            <MenuItem value="True or False">True or False</MenuItem>
                            <MenuItem value="Identification">Identification</MenuItem>
                            <MenuItem value="Worded Problem">Worded Problem</MenuItem>
                            <MenuItem value="Essay">Essay</MenuItem>
                        </Select>
                        {errors.type && <Typography color="error">{errors.type}</Typography>}
                    </FormControl>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        margin="normal"
                    />
                    {errors.question && <Typography color="error">{errors.question}</Typography>}

                    {/* Dynamic Inputs Based on Question Type */}
                    {type === 'Multiple Choice' && (
                        <>
                            <Typography variant="subtitle1">Choices:</Typography>
                            <RadioGroup
                                value={correctAnswer}
                                onChange={(e) => setCorrectAnswer(e.target.value)}
                            >
                                {['choice1', 'choice2', 'choice3', 'choice4'].map((choice, index) => (
                                    <Box key={choice} display="flex" alignItems="center">
                                        <FormControlLabel
                                            control={<Radio />}
                                            value={choices[choice]} // The value for the radio button
                                            label=""
                                            sx={{ marginRight: 1 }} // Adjust spacing
                                        />
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            label={`Choice ${index + 1}`}
                                            value={choices[choice]}
                                            onChange={(e) =>
                                                setChoices((prev) => ({ ...prev, [choice]: e.target.value }))
                                            }
                                        />
                                    </Box>
                                ))}
                            </RadioGroup>
                        </>

                    )}

                    {type === 'True or False' && (
                        <RadioGroup
                            value={torAnswer}
                            onChange={(e) => setTorAnswer(e.target.value)}
                        >
                            <FormControlLabel control={<Radio />} value="True" label="True" />
                            <FormControlLabel control={<Radio />} value="False" label="False" />
                        </RadioGroup>
                    )}

                    {type === 'Identification' && (
                        <TextField
                            fullWidth
                            label="Answer"
                            value={identificationAnswer}
                            onChange={(e) => setIdentificationAnswer(e.target.value)}
                            margin="normal"
                        />
                    )}

                    {type === 'Worded Problem' && (
                        <TextField
                            fullWidth
                            label="Numeric Answer"
                            type="number"
                            value={wordedProblemAnswer}
                            onChange={(e) => setWordedProblemAnswer(e.target.value)}
                            margin="normal"
                        />
                    )}

                    {type === 'Essay' && (
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Answer"
                            value={essayAnswer}
                            onChange={(e) => setEssayAnswer(e.target.value)}
                            margin="normal"
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closeAddQuestionModal}
                        size="large"
                        color="primary"
                        variant="outlined"
                        sx={{ marginBottom: '20px'}}
                    >Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        size="large"
                        color="primary"
                        variant="outlined"
                        sx={{ marginBottom: '20px', marginRight: '15px' }}
                    >
                        {editingQuestion ? 'Update' : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={handleSnackbarClose} severity="success" variant="filled">
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            <Button onClick={onBackToTopics} sx={{ mt: 2 }}>
                Back to Topics
            </Button>
        </Box>
    );
};

export default QuestionTable;

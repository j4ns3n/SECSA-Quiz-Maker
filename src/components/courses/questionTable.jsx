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
    const [questions, setQuestions] = useState(topic.questions || []);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [questionId, setQuestionId] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [errors, setErrors] = useState({});
    const [wordedProblemAnswer, setWordedProblemAnswer] = useState('');
    const [torAnswer, setTorAnswer] = useState('');
    const [indetificationAnswer, setIndetificationAnswer] = useState('');
    const [essayAnswer, setEssayAnswer] = useState('');

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

        if (type === 'Identification' && !indetificationAnswer) {
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
        setOpenDialog(false);
    }; const handleChangeDifficulty = (event) => {
        setDifficulty(event.target.value);
        // Clear error when the difficulty is selected
        if (event.target.value) {
            setErrors((prevErrors) => ({ ...prevErrors, difficulty: '' }));
        }
    };

    const handleChangeType = (event) => {
        setType(event.target.value);
        setCorrectAnswer('');
        setChoices({ choice1: '', choice2: '', choice3: '', choice4: '' });

        // Clear error when the type is selected
        if (event.target.value) {
            setErrors((prevErrors) => ({ ...prevErrors, type: '' }));
        }
    };

    const handleCorrectAnswerChange = (event) => {
        setCorrectAnswer(event.target.value);

        // Clear error when the correct answer is selected
        if (event.target.value) {
            setErrors((prevErrors) => ({ ...prevErrors, correctAnswer: '' }));
        }
    };

    const handleChoiceChange = (event) => {
        setChoices({
            ...choices,
            [event.target.name]: event.target.value
        });

        // Clear error when a choice is entered
        if (event.target.value) {
            setErrors((prevErrors) => ({ ...prevErrors, choices: '' }));
        }
    };

    const handleQuestionChange = (event) => {
        setQuestion(event.target.value);

        // Clear error when the question is entered
        if (event.target.value) {
            setErrors((prevErrors) => ({ ...prevErrors, question: '' }));
        }
    };


    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
        setOpenAdd(false);
        setDeleteSnack(false);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const addQuestion = async () => {

        if (!validateForm()) {
            return;  // Exit if form is not valid
        }

        const questionData = {
            type,
            difficulty,
            questionText: question,
            choices: type === 'Multiple Choice' ? Object.values(choices) : '',
            answer: type === 'Multiple Choice' ? correctAnswer : 
                type === 'True or False' ? torAnswer :
                    type === 'Identification' ? indetificationAnswer :
                        type === 'Worded Problem' ? wordedProblemAnswer :
                            type === 'Essay' ? essayAnswer : ''
        };

        console.log(questionData);

        try {
            const response = await fetch(`/api/courses/${courseId}/year/${selectedYearLevel}/subject/${subjectName}/topics/${topic.topicName}/questions`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(questionData),
            });

            if (response.ok) {
                const result = await response.json();
                setOpenAdd(true);
                if (!result.newQuestion) {
                    console.error('No newQuestion found in the response');
                    return;
                }

                const updatedQuestions = [...questions, result.newQuestion];
                setQuestions(updatedQuestions);
                onUpdateQuestions(updatedQuestions);

                resetForm();
            } else {
                console.error('Failed to add question');
            }
        } catch (err) {
            console.error('Error adding question:', err);
        }
    };

    const updateQuestion = async () => {

        console.log(editingQuestion);

        const questionData = {
            type,
            difficulty,
            questionText: question,
            choices: type === 'Multiple Choice' ? Object.values(choices) : undefined, // Include choices here
            answer: type === 'Multiple Choice' ? Object.keys(choices).indexOf(correctAnswer) :
                type === 'True or False' ? torAnswer :
                    type === 'Identification' ? indetificationAnswer :
                        type === 'Worded Problem' ? wordedProblemAnswer :
                            type === 'Essay' ? essayAnswer : ''
        };
        console.log(editingQuestion);

        try {
            const response = await fetch(`/api/courses/${courseId}/year/${selectedYearLevel}/subject/${subjectName}/topics/${topic.topicName}/questions/${editingQuestion._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(questionData),
            });

            if (response.ok) {
                const result = await response.json();
                const updatedQuestions = questions.map(q => (q._id === result.updatedQuestion._id ? result.updatedQuestion : q));
                setOpen(true);

                setQuestions(updatedQuestions);
                onUpdateQuestions(updatedQuestions);
                resetForm();
            } else {
                console.error('Failed to update question');
            }
        } catch (err) {
            console.error('Error updating question:', err);
        }
    };

    const deleteQuestion = async () => {
        try {
            const response = await fetch(`/api/courses/${courseId}/year/${selectedYearLevel}/subject/${subjectName}/topics/${topic.topicName}/questions/${questionId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Question deleted successfully', result);
                const updatedQuestions = result.updatedQuestions;
                setQuestions(updatedQuestions);
                onUpdateQuestions(updatedQuestions);
                setDeleteSnack(true);
                setOpenDialog(false);
            } else {
                console.error('Failed to delete question');
            }
        } catch (err) {
            console.error('Error deleting question:', err);
        }
    };

    const startEditing = (question) => {
        console.log(question);
        setEditingQuestion(question);
        setType(question.type);
        setDifficulty(question.difficulty);
        setQuestion(question.questionText);
        if (question.type === 'Multiple Choice') {
            setChoices({
                choice1: question.choices[0] || '',
                choice2: question.choices[1] || '',
                choice3: question.choices[2] || '',
                choice4: question.choices[3] || ''
            });
            setCorrectAnswer(question.answer);
        } else if(question.type === 'True or False') {
            setTorAnswer(question.answer);
            setIndetificationAnswer(question.answer);
            setWordedProblemAnswer(question.answer);
            setEssayAnswer(question.answer);
        }
    };

    const resetForm = () => {
        setQuestion('');
        setChoices({ choice1: '', choice2: '', choice3: '', choice4: '' });
        setCorrectAnswer('');
        setDifficulty('');
        setType('');
        setIndetificationAnswer('');
        setTorAnswer('');
        setWordedProblemAnswer('');
        setEssayAnswer('');
        setEditingQuestion(null); // Reset the editing state
    };

    return (
        <Box>
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
                        Are you sure you want to delete this Question?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialogBox}>No</Button>
                    <Button onClick={deleteQuestion} autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={openAdd} autoHideDuration={2000} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Question added successfully!
                </Alert>
            </Snackbar>

            <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Question updated successfully!
                </Alert>
            </Snackbar>

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
            <FormControl style={{ width: "150px", marginRight: "10px" }}>
                <InputLabel id="difficulty-select-label">Difficulty</InputLabel>
                <Select
                    labelId="difficulty-select-label"
                    id="difficulty-select-select"
                    value={difficulty}
                    label="Difficulty"
                    onChange={handleChangeDifficulty}
                >
                    <MenuItem value={"Easy"}>Easy</MenuItem>
                    <MenuItem value={"Intermediate"}>Intermediate</MenuItem>
                    <MenuItem value={"Difficult"}>Difficult</MenuItem>
                </Select>
                {errors.difficulty && <Typography variant="caption" color="error">{errors.difficulty}</Typography>}
            </FormControl>

            <FormControl style={{ width: "150px", marginRight: "10px" }}>
                <InputLabel id="type-select-label">Type</InputLabel>
                <Select
                    labelId="type-select-label"
                    id="type-select-select"
                    value={type}
                    label="Type"
                    helperText={errors.type}
                    onChange={handleChangeType}
                >
                    <MenuItem value={"Multiple Choice"}>Multiple Choice</MenuItem>
                    <MenuItem value={"True or False"}>True or False</MenuItem>
                    <MenuItem value={"Identification"}>Identification</MenuItem>
                    <MenuItem value={"Worded Problem"}>Worded Problem</MenuItem>
                    <MenuItem value={"Essay"}>Essay</MenuItem>
                </Select>
                {errors.type && <Typography variant="caption" color="error">{errors.type}</Typography>}
            </FormControl>
            <br />
            <br />
            <FormControl>
                <TextField
                    id="question"
                    label="Question"
                    variant="outlined"
                    minRows={3}
                    maxRows={5}
                    multiline
                    fullWidth  // Adjusts the width to fit the container
                    InputProps={{
                        style: {
                            resize: "vertical",  // Allows vertical resizing
                            overflow: "auto",  // Adds scroll if needed
                        },
                    }}
                    style={{ width: "310px" }}
                    value={question}
                    onChange={handleQuestionChange}
                />
                {errors.question && <Typography variant="caption" color="error">{errors.question}</Typography>}
            </FormControl>
            <br />
            <br />

            {type === 'Multiple Choice' && (
                <>
                    <Typography><strong>Type:</strong> {type}</Typography>
                    <RadioGroup value={correctAnswer} onChange={handleCorrectAnswerChange}>
                        <FormControlLabel
                            control={<Radio />}
                            label={
                                <TextField
                                    id="choice1"
                                    name="choice1"
                                    label="Choice 1"
                                    variant="outlined"
                                    style={{ width: "310px", marginTop: "10px", marginRight: "10px" }}
                                    value={choices.choice1}
                                    onChange={handleChoiceChange}
                                />
                            }
                            value={choices.choice1}
                        />
                        <FormControlLabel
                            control={<Radio />}
                            label={
                                <TextField
                                    id="choice2"
                                    name="choice2"
                                    label="Choice 2"
                                    variant="outlined"
                                    style={{ width: "310px", marginTop: "10px" }}
                                    value={choices.choice2}
                                    onChange={handleChoiceChange}
                                />
                            }
                            value={choices.choice2}
                        />
                        <FormControlLabel
                            control={<Radio />}
                            label={
                                <TextField
                                    id="choice3"
                                    name="choice3"
                                    label="Choice 3"
                                    variant="outlined"
                                    style={{ width: "310px", marginTop: "10px", marginRight: "10px" }}
                                    value={choices.choice3}
                                    onChange={handleChoiceChange}
                                />
                            }
                            value={choices.choice3}
                        />
                        <FormControlLabel
                            control={<Radio />}
                            label={
                                <TextField
                                    id="choice4"
                                    name="choice4"
                                    label="Choice 4"
                                    variant="outlined"
                                    style={{ width: "310px", marginTop: "10px" }}
                                    value={choices.choice4}
                                    onChange={handleChoiceChange}
                                />
                            }
                            value={choices.choice4}
                        />
                    </RadioGroup>
                    {errors.choices && <Typography variant="caption" color="error">{errors.choices}</Typography>}
                    {errors.correctAnswer && <Typography variant="caption" color="error">{errors.correctAnswer}</Typography>}
                </>
            )}

            {type === 'True or False' && (
                <>
                    <Typography><strong>Type:</strong> {type}</Typography>
                    <RadioGroup value={torAnswer} onChange={(e) => setTorAnswer(e.target.value)}>
                        <FormControlLabel
                            control={<Radio />}
                            label="True"
                            value="True"
                        />
                        <FormControlLabel
                            control={<Radio />}
                            label="False"
                            value="False"
                        />
                    </RadioGroup>
                    {errors.correctAnswer && <Typography variant="caption" color="error">{errors.correctAnswer}</Typography>}
                </>
            )}

            {type === 'Identification' && (
                <>
                    <Typography><strong>Type:</strong> {type}</Typography>
                    <FormControl>
                        <TextField
                            id="identification"
                            label="Answer"
                            variant="outlined"
                            style={{ width: "310px", marginTop: "10px" }}
                            value={indetificationAnswer}
                            onChange={(e) => setIndetificationAnswer(e.target.value)}
                        />
                        {errors.correctAnswer && <Typography variant="caption" color="error">{errors.correctAnswer}</Typography>}
                    </FormControl>
                </>
            )}

            {/* New input for Worded Problem */}
            {type === 'Worded Problem' && (
                <>
                    <Typography><strong>Type:</strong> {type}</Typography>
                    <FormControl>
                        <TextField
                            id="wordedProblemAnswer"
                            label="Numeric Answer"
                            variant="outlined"
                            style={{ width: "310px", marginTop: "10px" }}
                            value={wordedProblemAnswer}
                            onChange={(e) => setWordedProblemAnswer(e.target.value)}
                            type="number" // Ensure only numeric input
                        />
                        {errors.wordedProblemAnswer && <Typography variant="caption" color="error">{errors.wordedProblemAnswer}</Typography>}
                    </FormControl>
                </>
            )}

            {/* New input for Essay */}
            {type === 'Essay' && (
                <>
                    <Typography><strong>Type:</strong> {type}</Typography>
                    <FormControl>
                        <TextField
                            id="essayAnswer"
                            label="Answer"
                            variant="outlined"
                            style={{ width: "310px", marginTop: "10px" }}
                            value={essayAnswer}
                            onChange={(e) => setEssayAnswer(e.target.value)}
                            multiline={true} // Allow multiple lines
                            rows={4} // Set the number of rows
                        />
                        {errors.essayAnswer && <Typography variant="caption" color="error">{errors.essayAnswer}</Typography>}
                    </FormControl>
                </>
            )}

            <br />
            <br />
            {editingQuestion ? (
                <>
                    <Button
                        size="large"
                        color="primary"
                        variant="outlined"
                        sx={{ paddingBottom: '4px' }}
                        onClick={updateQuestion}
                    >
                        Update
                    </Button>
                    <Button
                        size="large"
                        color="error"
                        variant="outlined"
                        sx={{ paddingBottom: '4px', ml: 2 }}
                        onClick={resetForm}
                    >
                        Cancel
                    </Button>
                </>
            ) : (
                <Button
                    size="large"
                    color="primary"
                    variant="outlined"
                    sx={{ paddingBottom: '4px' }}
                    onClick={addQuestion}
                >
                    Submit
                </Button>
            )}

            <br /><br />
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
                        {questions.length > 0 ? (
                            questions
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((question, index) => (
                                    <TableRow key={question._id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{question.questionText}</TableCell>
                                        <TableCell>{question.difficulty}</TableCell>
                                        <TableCell>{question.type}</TableCell>
                                        <TableCell align="center">
                                            <IconButton onClick={() => startEditing(question)}>
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
                                <TableCell colSpan={4}>No questions available</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={questions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            <Button onClick={onBackToTopics} sx={{ mt: 2 }}>
                Back to Topics
            </Button>
        </Box>
    );
};

export default QuestionTable;

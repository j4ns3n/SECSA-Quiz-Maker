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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { blue, red } from '@mui/material/colors';
import FormControl from '@mui/material/FormControl';

const QuestionTable = ({ topic, subjectName, courseId, selectedYearLevel, onBack, onQuestionAdded }) => {
    const [difficulty, setDifficulty] = useState('');
    const [open, setOpen] = useState(false);
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
    const [editingQuestion, setEditingQuestion] = useState(null);  // To track the question being edited

    const handleChangeDifficulty = (event) => {
        setDifficulty(event.target.value);
    };

    const handleChangeType = (event) => {
        setType(event.target.value);
        setCorrectAnswer('');
        setChoices({ choice1: '', choice2: '', choice3: '', choice4: '' });
    };

    const handleCorrectAnswerChange = (event) => {
        setCorrectAnswer(event.target.value);
    };

    const handleChoiceChange = (event) => {
        setChoices({
            ...choices,
            [event.target.name]: event.target.value
        });
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
        setDeleteSnack(false); // Close delete alert
    };

    const handleQuestionChange = (event) => {
        setQuestion(event.target.value);
    };

    const addQuestion = async () => {
        const questionData = {
            type,
            difficulty,
            questionText: question,
            choices: Object.values(choices).filter(choice => choice !== ''),
            answer: type === 'Multiple Choice' ? Object.keys(choices).indexOf(correctAnswer) : correctAnswer
        };

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

                if (!result.newQuestion) {
                    console.error('No newQuestion found in the response');
                    return;
                }

                if (onQuestionAdded) {
                    onQuestionAdded(result.newQuestion);
                }

                setQuestions([...questions, result.newQuestion]);

                resetForm();
            } else {
                console.error('Failed to add question');
            }
        } catch (err) {
            console.error('Error adding question:', err);
        }
    };

    const updateQuestion = async () => {
        const questionData = {
            type,
            difficulty,
            questionText: question,
            choices: Object.values(choices).filter(choice => choice !== ''),
            answer: type === 'Multiple Choice' ? Object.keys(choices).indexOf(correctAnswer) : correctAnswer
        };

        console.log(editingQuestion._id);

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
                resetForm();
            } else {
                console.error('Failed to update question');
            }
        } catch (err) {
            console.error('Error updating question:', err);
        }
    };

    const deleteQuestion = async (questionId) => {
        try {
            const response = await fetch(`/api/courses/${courseId}/year/${selectedYearLevel}/subject/${subjectName}/topics/${topic.topicName}/questions/${questionId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Question deleted successfully', result);
                setQuestions(result.updatedQuestions);
                setDeleteSnack(true);
            } else {
                console.error('Failed to delete question');
            }
        } catch (err) {
            console.error('Error deleting question:', err);
        }
    };

    const startEditing = (question) => {
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
            setCorrectAnswer(`choice${question.answer + 1}`);
        } else {
            setCorrectAnswer(question.answer);
        }
    };

    const resetForm = () => {
        setQuestion('');
        setChoices({ choice1: '', choice2: '', choice3: '', choice4: '' });
        setCorrectAnswer('');
        setDifficulty('');
        setType('');
        setEditingQuestion(null); // Reset the editing state
    };

    return (
        <Box>

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
            <br /><br />
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
            </FormControl>

            <FormControl style={{ width: "150px", marginRight: "10px" }}>
                <InputLabel id="type-select-label">Type</InputLabel>
                <Select
                    labelId="type-select-label"
                    id="type-select-select"
                    value={type}
                    label="Type"
                    onChange={handleChangeType}
                >
                    <MenuItem value={"Multiple Choice"}>Multiple Choice</MenuItem>
                    <MenuItem value={"True or False"}>True or False</MenuItem>
                    <MenuItem value={"Identification"}>Identification</MenuItem>
                </Select>
            </FormControl>

            <FormControl>
                <TextField
                    id="question"
                    label="Question"
                    variant="outlined"
                    style={{ width: "310px" }}
                    value={question}
                    onChange={handleQuestionChange}
                />
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
                            value="choice1"
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
                            value="choice2"
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
                            value="choice3"
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
                            value="choice4"
                        />
                    </RadioGroup>
                </>
            )}

            {type === 'True or False' && (
                <>
                    <Typography><strong>Type:</strong> {type}</Typography>
                    <RadioGroup value={correctAnswer} onChange={handleCorrectAnswerChange}>
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
                            value={correctAnswer}
                            onChange={handleCorrectAnswerChange}
                        />
                    </FormControl>
                </>
            )}

            <br /><br />
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
                            <TableCell>Question</TableCell>
                            <TableCell>Difficulty</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {questions.map((question) => (
                            <TableRow key={question._id}>
                                <TableCell>{question.questionText}</TableCell>
                                <TableCell>{question.difficulty}</TableCell>
                                <TableCell>{question.type}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => startEditing(question)}>
                                        <EditIcon sx={{ color: blue[600] }} />
                                    </IconButton>
                                    <IconButton onClick={() => deleteQuestion(question._id)}>
                                        <DeleteIcon sx={{ color: red[900] }} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Back button to go back to topics */}
            <Button onClick={onBack} sx={{ mt: 2 }}>
                Back to Topics
            </Button>
        </Box>
    );
};

export default QuestionTable;

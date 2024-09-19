import React, { useState, useEffect } from 'react';
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
    TextField,
    Alert,
    Snackbar,
    IconButton,
    TablePagination
} from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { blue, red } from '@mui/material/colors';
import QuestionTable from './questionTable'; // Import the QuestionTable component

const TopicsTable = ({ subject, courseId, selectedYearLevel, onBack }) => {
    const [topics, setTopics] = useState(subject.topics || []);
    const [topicName, setTopicName] = useState('');
    const [topicDesc, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);  // Manage questions state
    const [editingTopicId, setEditingTopicId] = useState(null); // State for editing a topic
    const [open, setOpen] = useState(false);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false); // For delete success message
    const [updateAlert, setUpdateAlert] = useState(false); // For delete success message
    const [viewingQuestions, setViewingQuestions] = useState(false); // To toggle between topics and questions
    const [selectedTopic, setSelectedTopicId] = useState(null); // Track the selected topic for questions

    // State for pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        setTopics(subject.topics);
    }, [subject]);

    const handleTopicNameChange = (event) => {
        setTopicName(event.target.value);
    };

    const handleTopicDescChange = (event) => {
        setDescription(event.target.value);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
        setDeleteAlertOpen(false); // Close delete alert
    };

    const addTopic = async (e) => {
        if (editingTopicId) return;
        e.preventDefault();

        const newTopic = { topicName, topicDesc, questions };

        setOpen(true);
        try {
            const response = await fetch(`/api/courses/${courseId}/year/${selectedYearLevel}/subject/${subject.subjectName}/topics`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTopic),
            });

            if (response.ok) {
                const result = await response.json();

                if (!result.newTopic) {
                    console.error('No newTopic found in the response');
                }

                // Set the topics list with the new topic added
                setTopics((prevTopics) => [...prevTopics, result.newTopic]);

                setTopicName(result.newTopic.topicName);
                setDescription(result.newTopic.topicDesc);
            } else {
                console.error('Failed to add topic');
            }
        } catch (err) {
            console.error('Error adding topic:', err);
        }
    };

    const deleteTopic = async (topicId) => {
        try {
            const response = await fetch(`/api/courses/${courseId}/year/${selectedYearLevel}/subject/${subject.subjectName}/topics/${topicId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Topic deleted successfully', result);

                setTopics(result.updatedTopics);
                setDeleteAlertOpen(true); // Show delete success message
            } else {
                console.error('Failed to delete topic');
            }
        } catch (err) {
            console.error('Error deleting topic:', err);
        }
    };

    const editTopic = async () => {

        const updatedTopic = { topicName, topicDesc, questions };

        try {
            const response = await fetch(`/api/courses/${courseId}/year/${selectedYearLevel}/subject/${subject.subjectName}/topics/${editingTopicId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTopic),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Topic updated successfully', result);

                setTopics((prevTopics) => prevTopics.map(topic =>
                    topic._id === editingTopicId ? { ...topic, ...updatedTopic } : topic
                ));

                setEditingTopicId(null);
                setTopicName('');
                setDescription('');
                setUpdateAlert(true);
            } else {
                console.error('Failed to update topic');
            }
        } catch (err) {
            console.error('Error updating topic:', err);
        }
    };

    const handleEditClick = (topicId) => {
        const topic = topics.find(t => t._id === topicId);
        if (topic) {
            setEditingTopicId(topicId);
            setTopicName(topic.topicName);
            setDescription(topic.topicDesc);
            setQuestions(topic.questions || []); // Set questions for editing
        }
    };

    const handleViewQuestionsClick = (topic) => {
        setSelectedTopicId(topic); // Save the topic
        setQuestions(topic.questions || []); // Pass the questions
        setViewingQuestions(true); // Toggle to view questions
    };

    const handleBackToTopics = () => {
        setViewingQuestions(false); // Go back to viewing topics
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleBack = () => {
        onBack({ ...subject, topics }); // Pass the updated subject with topic count to the parent
    };

    const handleQuestionAdded = (newQuestion) => {
        setTopics((prevTopics) =>
            prevTopics.map((topic) =>
                topic._id === selectedTopic._id
                    ? { ...topic, questions: [...topic.questions, newQuestion] }
                    : topic
            )
        );
    };


    return (
        <Box>
            {viewingQuestions ? (
                <QuestionTable
                    subjectName={subject.subjectName}
                    courseId={courseId}
                    selectedYearLevel={selectedYearLevel}
                    topic={selectedTopic}
                    questions={questions} // Pass questions directly
                    onBack={handleBackToTopics}
                    QuestionAdded={handleQuestionAdded}  
                />
            ) : (
                <>
                    <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
                        <Alert
                            onClose={handleClose}
                            severity="success"
                            variant="filled"
                            sx={{ width: '100%' }}
                        >
                            Topic added successfully!
                        </Alert>
                    </Snackbar>
                    <Snackbar open={updateAlert} autoHideDuration={2000} onClose={handleClose}>
                        <Alert
                            onClose={handleClose}
                            severity="success"
                            variant="filled"
                            sx={{ width: '100%' }}
                        >
                            Topic updated successfully!
                        </Alert>
                    </Snackbar>

                    <Snackbar open={deleteAlertOpen} autoHideDuration={2000} onClose={handleClose}>
                        <Alert
                            onClose={handleClose}
                            severity="success"
                            variant="filled"
                            sx={{ width: '100%' }}
                        >
                            Topic deleted successfully!
                        </Alert>
                    </Snackbar>

                    <br />
                    <br />
                    <Typography variant="h5" gutterBottom>
                        Topics for {subject.subjectName}
                    </Typography>
                    <br />
                    <br />
                    <TextField
                        id="outlined-basic"
                        label="Topic Name"
                        variant="outlined"
                        size="small"
                        sx={{ marginRight: '10px' }}
                        value={topicName}
                        onChange={handleTopicNameChange}
                    />
                    <TextField
                        id="outlined-basic"
                        label="Topic Description"
                        size="small"
                        variant="outlined"
                        sx={{ marginRight: '10px' }}
                        value={topicDesc}
                        onChange={handleTopicDescChange}
                    />
                    <Button
                        size="large"
                        color="primary"
                        variant="outlined"
                        sx={{ paddingBottom: '4px' }}
                        onClick={editingTopicId ? editTopic : addTopic}
                        QuestionAdded={handleQuestionAdded}
                    >
                        {editingTopicId ? 'Update' : 'Submit'}
                    </Button>
                    <br />
                    <br />
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="topics table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Topic Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Questions</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {topics.length > 0 ? (topics.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((topic) => (
                                    <TableRow key={topic._id}>
                                        <TableCell>{topic.topicName}</TableCell>
                                        <TableCell>{topic.topicDesc}</TableCell>
                                        <TableCell>{topic.questions.length}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleViewQuestionsClick(topic)}>
                                                <RemoveRedEyeIcon sx={{ cursor: 'pointer' }} />
                                            </IconButton>
                                            <IconButton onClick={() => handleEditClick(topic._id)}>
                                                <EditIcon sx={{ color: blue[600] }} />
                                            </IconButton>
                                            <IconButton onClick={() => deleteTopic(topic._id)}>
                                                <DeleteIcon sx={{ color: red[900] }} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))) : (
                                    <TableRow>
                                        <TableCell colSpan={4}>No topics available</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={topics.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </TableContainer>
                    <Button onClick={handleBack} sx={{ mt: 2 }}>
                        Back to Subjects
                    </Button>
                </>
            )}
        </Box>
    );
};

export default TopicsTable;

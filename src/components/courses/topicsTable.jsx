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
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { blue, red } from '@mui/material/colors';
import QuestionTable from './questionTable';

const TopicsTable = ({ subject, courseId, selectedYearLevel, onBack }) => {
    const [topics, setTopics] = useState(subject.topics || []);
    const [topicName, setTopicName] = useState('');
    const [topicDesc, setTopicDesc] = useState('');
    const [questions, setQuestions] = useState([]);
    const [editingTopicId, setEditingTopicId] = useState(null);
    const [alerts, setAlerts] = useState({ open: false, message: '', severity: 'success' });
    const [viewingQuestions, setViewingQuestions] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [topicId, setTopicId] = useState('');

    // State for pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        setTopics(subject.topics);
    }, [subject]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleAlertClose = () => {
        setAlerts({ ...alerts, open: false });
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const handleTopicChange = (event) => {
        const { name, value } = event.target;
        if (name === 'topicName') setTopicName(value);
        if (name === 'topicDesc') setTopicDesc(value);
    };

    const clearInputs = () => {
        setTopicName('');
        setTopicDesc('');
        setQuestions([]);
        setEditingTopicId(null);
    };

    const addTopic = async (e) => {
        e.preventDefault();
        if (editingTopicId) return;

        const newTopic = { topicName, topicDesc, questions };

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
                setTopics((prevTopics) => [...prevTopics, result.newTopic]);
                setAlerts({ open: true, message: 'Topic added successfully!', severity: 'success' });
                clearInputs();
            } else {
                throw new Error('Failed to add topic');
            }
        } catch (error) {
            console.error(error);
            setAlerts({ open: true, message: 'Error adding topic!', severity: 'error' });
        }
    };

    const deleteTopic = async () => {
        try {
            const response = await fetch(`/api/courses/${courseId}/year/${selectedYearLevel}/subject/${subject.subjectName}/topics/${topicId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                const result = await response.json();
                setTopics(result.updatedTopics);
                setAlerts({ open: true, message: 'Topic deleted successfully!', severity: 'success' });
                handleDialogClose();
            } else {
                throw new Error('Failed to delete topic');
            }
        } catch (error) {
            console.error(error);
            setAlerts({ open: true, message: 'Error deleting topic!', severity: 'error' });
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
                setTopics((prevTopics) => prevTopics.map(topic =>
                    topic._id === editingTopicId ? { ...topic, ...updatedTopic } : topic
                ));
                setAlerts({ open: true, message: 'Topic updated successfully!', severity: 'success' });
                clearInputs();
            } else {
                throw new Error('Failed to update topic');
            }
        } catch (error) {
            console.error(error);
            setAlerts({ open: true, message: 'Error updating topic!', severity: 'error' });
        }
    };

    const handleEditClick = (topicId) => {
        const topic = topics.find(t => t._id === topicId);
        if (topic) {
            setEditingTopicId(topicId);
            setTopicName(topic.topicName);
            setTopicDesc(topic.topicDesc);
            setQuestions(topic.questions || []);
        }
    };

    const handleViewQuestionsClick = (topic) => {
        setSelectedTopic(topic); // Save the topic
        setQuestions(topic.questions || []);
        setViewingQuestions(true); // Toggle to view questions
    };

    const handleBack = () => {
        onBack({ ...subject, topics });
    };

    const updateQuestions = (topicId, updatedQuestions) => {
        setTopics((prevTopics) =>
            prevTopics.map((topic) =>
                topic._id === topicId ? { ...topic, questions: updatedQuestions } : topic
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
                    questions={questions}
                    onBackToTopics={() => setViewingQuestions(false)}
                    onUpdateQuestions={(updatedQuestions) => updateQuestions(selectedTopic._id, updatedQuestions)}
                />
            ) : (
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
                                Are you sure you want to delete this Topic?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDialogClose}>No</Button>
                            <Button onClick={deleteTopic} autoFocus>
                                Yes
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Snackbar open={alerts.open} autoHideDuration={2000} onClose={handleAlertClose}>
                        <Alert
                            onClose={handleAlertClose}
                            severity={alerts.severity}
                            variant="filled"
                            sx={{ width: '100%' }}
                        >
                            {alerts.message}
                        </Alert>
                    </Snackbar>
                    <br />
                    <br />
                    <Typography variant="h5" gutterBottom>
                        Topics for {subject.subjectName}
                    </Typography>
                    <br />
                    <TextField
                        name="topicName"
                        label="Topic Name"
                        variant="outlined"
                        size="small"
                        sx={{ marginRight: '10px' }}
                        value={topicName}
                        onChange={handleTopicChange}
                    />
                    <TextField
                        name="topicDesc"
                        label="Topic Description"
                        size="small"
                        variant="outlined"
                        sx={{ marginRight: '10px' }}
                        value={topicDesc}
                        onChange={handleTopicChange}
                    />
                    <Button
                        size="large"
                        color="primary"
                        variant="outlined"
                        sx={{ paddingBottom: '4px' }}
                        onClick={editingTopicId ? editTopic : addTopic}
                    >
                        {editingTopicId ? 'Update' : 'Submit'}
                    </Button>

                    {editingTopicId && (
                        <Button
                            size="large"
                            color="error"
                            variant="outlined"
                            sx={{ paddingBottom: '4px', ml: 2 }}
                            onClick={clearInputs}
                        >
                            Cancel
                        </Button>
                    )}
                    <br />
                    <br />
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="topics table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>No.</TableCell>
                                    <TableCell>Topic Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Questions</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {topics.length > 0 ? (
                                    topics.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((topic, index) => (
                                        <TableRow key={topic._id}>
                                            <TableCell>{index + 1}</TableCell>
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
                                                <IconButton onClick={() => { setTopicId(topic._id); setOpenDialog(true); }}>
                                                    <DeleteIcon sx={{ color: red[900] }} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
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
            )
            }
        </Box >
    );
};

export default TopicsTable;

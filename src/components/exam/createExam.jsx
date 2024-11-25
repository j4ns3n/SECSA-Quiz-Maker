import React, { useEffect, useState } from 'react';
import {
    Typography,
    TextField,
    InputLabel,
    MenuItem,
    FormControl,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Snackbar,
    Alert,
    Input,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import { useCoursesContext } from '../../hooks/useCourseContext';

const CreateExam = () => {
    const [title, setTitle] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [desc, setDesc] = useState('');
    const [selectedYearLevel, setSelectedYearLevel] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [topics, setTopics] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState({});
    const [errors, setErrors] = useState({});
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [alerts, setAlerts] = useState({ open: false, message: '', severity: 'success' });
    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('All');

    const { courses, dispatch } = useCoursesContext();

    useEffect(() => {
        const fetchCourse = async () => {
            const response = await fetch('/api/courses');
            const json = await response.json();

            if (response.ok) {
                dispatch({ type: 'SET_COURSES', payload: json });
            }
        };

        fetchCourse();
    }, [dispatch]);


    const filterQuestionsByType = (questions) => {
        if (selectedType === 'All') return questions;
        return questions.filter(question => question.type === selectedType);
    };


    const getChoiceLabel = (index) => {
        const labels = ['A', 'B', 'C', 'D'];
        return labels[index] || '';
    };

    const handleAlertClose = () => {
        setAlerts({ ...alerts, open: false });
    };

    const handlePreviewOpen = () => {
        setPreviewOpen(true);
    };

    const handlePreviewClose = () => {
        setPreviewOpen(false);
    };

    const handleCourseChange = (event) => {
        const courseName = event.target.value;
        setSelectedCourse(courseName);
        setErrors((prev) => ({ ...prev, course: '' })); // Clear error
        setSelectedSubjects([]);
        setTopics([]);
        setSelectedQuestions({});
        switch (courseName) {
            case "BSIT":
                setDesc("Bachelor of Science in Information Technology");
                break;
            case "BSCE":
                setDesc("Bachelor of Science in Civil Engineering");
                break;
            case "BSME":
                setDesc("Bachelor of Science in Mechanical Engineering");
                break;
            case "BSEE":
                setDesc("Bachelor of Science in Electrical Engineering");
                break;
            case "BSARCH":
                setDesc("Bachelor of Science in Architecture");
                break;
            default:
                // Optional: Handle cases where `selectedCourse` does not match any case
                console.log("Course not found");
                break;
        }


        const selectedCourseData = courses.find(course => course.courseName === courseName);
        if (selectedCourseData) {
            setYearLevels(selectedCourseData.yearLevels);
            setSubjects([]);
            setTopics([]);
            setSelectedYearLevel('');
            setSelectedSubject('');
        }
    };

    const handleYearLevelChange = (event) => {
        const yearLevel = event.target.value;
        setSelectedYearLevel(yearLevel);
        setSelectedSubject('');
        setErrors((prev) => ({ ...prev, yearLevel: '' })); // Clear error
        setSelectedSubjects([]);
        setTopics([]);
        setSelectedQuestions({}); // Clear selected questions

        const selectedCourseData = courses.find(course => course.courseName === selectedCourse);
        if (selectedCourseData) {
            setSelectedSubjects([]);
            setTopics([]);
            const yearLevelData = selectedCourseData.yearLevels.find(yl => yl.year === yearLevel);
            if (yearLevelData) {
                setSubjects(yearLevelData.subjects);
            }
        }
    };

    const handleSubjectChange = (event) => {
        const subject = event.target.value;
        const isChecked = event.target.checked;

        // If subject is being selected (checked)
        if (isChecked) {
            setSelectedSubjects((prevSelectedSubjects) => [...prevSelectedSubjects, subject]);
            setErrors((prev) => ({ ...prev, subject: '' })); // Clear error

            // Find the selected subject's data
            const subjectData = subjects.find((sub) => sub.subjectName === subject);
            if (subjectData) {
                const updatedTopics = subjectData.topics.map((topic) => {
                    const difficultyCount = { easy: 0, medium: 0, hard: 0, total: 0 };

                    // Calculate the difficulty count for the topic
                    topic.questions.forEach((question) => {
                        if (question.difficulty === "Easy") {
                            difficultyCount.easy++;
                        } else if (question.difficulty === "Medium") {
                            difficultyCount.medium++;
                        } else if (question.difficulty === "Hard") {
                            difficultyCount.hard++;
                        }
                    });

                    difficultyCount.total = difficultyCount.easy + difficultyCount.medium + difficultyCount.hard;

                    return {
                        ...topic,
                        difficultyCount,
                    };
                });

                // Combine new topics with already selected topics
                setTopics((prevTopics) => [...prevTopics, ...updatedTopics]);
            }
        } else {
            // If the subject is being unselected (unchecked), remove it
            setSelectedSubjects((prevSelectedSubjects) =>
                prevSelectedSubjects.filter((sub) => sub !== subject)
            );

            // Clear selected questions when the subject is unchecked
            setSelectedQuestions({}); // Clear selected questions

            // Remove topics related to the unchecked subject
            const remainingSubjects = selectedSubjects.filter((sub) => sub !== subject);
            const updatedTopics = remainingSubjects.flatMap((remainingSubject) => {
                const subjectData = subjects.find((sub) => sub.subjectName === remainingSubject);
                if (subjectData) {
                    return subjectData.topics.map((topic) => {
                        const difficultyCount = { easy: 0, medium: 0, hard: 0, total: 0 };

                        topic.questions.forEach((question) => {
                            if (question.difficulty === "Easy") {
                                difficultyCount.easy++;
                            } else if (question.difficulty === "Medium") {
                                difficultyCount.medium++;
                            } else if (question.difficulty === "Hard") {
                                difficultyCount.hard++;
                            }
                        });

                        difficultyCount.total = difficultyCount.easy + difficultyCount.medium + difficultyCount.hard;

                        return {
                            ...topic,
                            difficultyCount,
                        };
                    });
                }
                return [];
            });

            setTopics(updatedTopics); // Set topics based on the remaining selected subjects
        }
    };

    const handleSubmit = async () => {
        const newErrors = {};
        if (!title) newErrors.title = "Title is required";
        if (!selectedCourse) newErrors.course = "Course is required";
        if (selectedSubjects.length === 0) newErrors.subject = "At least one Subject is required";

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            const examData = topics.map((topic, index) => ({
                topicName: topic.topicName,
                selectedQuestions: selectedQuestions[index] || { easy: [], intermediate: [], difficult: [] }
            }));

            const examSummary = {
                title,
                course: desc,
                yearLevel: selectedYearLevel,
                subjects: subjects.map(subject => subject.subjectName),
                topics: examData
            };

            console.log(examSummary); // Check your exam summary before submission

            // Submit the exam data to the server
            try {
                const response = await fetch('/api/exams', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(examSummary),
                });

                if (!response.ok) {
                    throw new Error('Failed to create exam');
                }

                setAlerts({ open: true, message: 'Exam Created successfully!', severity: 'success' });

                // Reset form fields
                setTitle('');
                setSelectedCourse('');
                setSelectedYearLevel('');
                setSelectedSubjects([]);
                setTopics([]);
                setSelectedQuestions({});
                setErrors({});
                setSubjects([]);
            } catch (error) {
                console.error('Error creating exam:', error);
            }
        }
    };

    const handleSelectChange = (topicIndex, difficulty, count) => {
        const topic = topics[topicIndex];
        const questionsForDifficulty = topic.questions.filter(
            (question) => question.difficulty.toLowerCase() === difficulty
        );

        // Ensure count is a number and non-negative
        const countValue = Math.max(0, parseInt(count, 10) || 0);
        const selected = questionsForDifficulty.slice(0, countValue);

        setSelectedQuestions(prevSelectedQuestions => {
            const updatedSelection = { ...prevSelectedQuestions };

            // Initialize topic index if it doesn't exist
            if (!updatedSelection[topicIndex]) {
                updatedSelection[topicIndex] = {
                    easy: [],
                    intermediate: [],
                    difficult: [],
                };
            }

            // Update the selected difficulty
            updatedSelection[topicIndex] = {
                ...updatedSelection[topicIndex],
                [difficulty]: selected,
            };

            return updatedSelection;
        });
    };

    return (
        <>
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
            <Typography variant="h5" gutterBottom>
                <br />
                Create an Exam
            </Typography>
            <br />
            <TextField
                id="outlined-basic"
                label="Title"
                variant="outlined"
                required
                value={title}
                error={!!errors.title}
                helperText={errors.title}
                onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value) {
                        setErrors((prev) => ({ ...prev, title: '' })); // Clear error
                    }
                }}
            />
            <br />
            <br />

            {/* Course Select */}
            <FormControl required sx={{ minWidth: 170, mr: 3 }} error={!!errors.course}>
                <InputLabel id="select-course-label">Course</InputLabel>
                <Select
                    labelId="select-course-label"
                    id="select-course"
                    value={selectedCourse}
                    label="Course"
                    onChange={handleCourseChange}
                >
                    {courses.map((course) => (
                        <MenuItem key={course._id} value={course.courseName}>
                            {course.courseName}
                        </MenuItem>
                    ))}
                </Select>
                {errors.course && <p style={{ color: 'red' }}>{errors.course}</p>}
            </FormControl>

            {/* Year Level Select */}
            <FormControl required sx={{ minWidth: 170, mr: 3 }} disabled={!selectedCourse} error={!!errors.yearLevel}>
                <InputLabel id="select-year-level-label">Year Level</InputLabel>
                <Select
                    labelId="select-year-level-label"
                    id="select-year-level"
                    value={selectedYearLevel}
                    label="Year Level"
                    onChange={handleYearLevelChange}
                >
                    {yearLevels.map((yearLevel, index) => (
                        <MenuItem key={index} value={yearLevel.year}>
                            {yearLevel.year}
                        </MenuItem>
                    ))}
                </Select>
                {errors.yearLevel && <p style={{ color: 'red' }}>{errors.yearLevel}</p>}
            </FormControl>

            <br />
            <br />
            {/* Subject Select */}
            <FormControl required sx={{ minWidth: 300, mr: 3 }} disabled={!selectedYearLevel || subjects.length === 0} error={!!errors.subject}>
                <div>
                    {subjects.map((subject) => (
                        <label key={subject._id}>
                            <input
                                type="checkbox"
                                value={subject.subjectName}
                                onChange={handleSubjectChange}
                                checked={selectedSubjects.includes(subject.subjectName)}
                            />
                            {subject.subjectName} <br />
                        </label>
                    ))}
                </div>
            </FormControl>
            <br />
            <br />

            {/* Table of Topics */}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="topics table">
                    <TableHead>
                        <TableRow>
                            <TableCell>No.</TableCell>
                            <TableCell>Topic Name</TableCell>
                            <TableCell>Easy</TableCell>
                            <TableCell>Intermediate</TableCell>
                            <TableCell>Difficult</TableCell>
                            <TableCell>Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {topics.map((topic, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{topic.topicName}</TableCell>

                                <TableCell>
                                    <FormControl sx={{ maxWidth: 50, display: 'flex', alignItems: 'center' }}>
                                        <Input
                                            type="number"
                                            value={selectedQuestions[index]?.easy?.length || 0}
                                            onChange={(e) => handleSelectChange(index, 'easy', e.target.value)}
                                        />
                                        <Typography variant="body2" color="textSecondary">
                                            ({topic.questions.filter(q => q.difficulty.toLowerCase() === 'easy').length})
                                        </Typography>
                                    </FormControl>
                                </TableCell>

                                <TableCell>
                                    <FormControl sx={{ maxWidth: 50, display: 'flex', alignItems: 'center' }}>
                                        <Input
                                            type="number"
                                            value={selectedQuestions[index]?.intermediate?.length || 0}
                                            onChange={(e) => handleSelectChange(index, 'intermediate', e.target.value)}
                                        />
                                        <Typography variant="body2" color="textSecondary">
                                            ({topic.questions.filter(q => q.difficulty.toLowerCase() === 'intermediate').length})
                                        </Typography>
                                    </FormControl>
                                </TableCell>

                                <TableCell>
                                    <FormControl sx={{ maxWidth: 50, display: 'flex', alignItems: 'center' }}>
                                        <Input
                                            type="number"
                                            value={selectedQuestions[index]?.difficult?.length || 0}
                                            onChange={(e) => handleSelectChange(index, 'difficult', e.target.value)}
                                        />
                                        <Typography variant="body2" color="textSecondary">
                                            ({topic.questions.filter(q => q.difficulty.toLowerCase() === 'difficult').length})
                                        </Typography>
                                    </FormControl>
                                </TableCell>

                                {/* Total */}
                                <TableCell>
                                    {(
                                        (selectedQuestions[index]?.easy?.length || 0) +
                                        (selectedQuestions[index]?.intermediate?.length || 0) +
                                        (selectedQuestions[index]?.difficult?.length || 0)
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
            </TableContainer>
            <br />
            <br />
            <Button variant="outlined" color="primary" sx={{ marginRight: 2 }} disabled={selectedSubjects.length === 0} onClick={handlePreviewOpen}>
                Preview Exam
            </Button>
            <Button variant="outlined" color="primary" onClick={handleSubmit}>
                Create Exam
            </Button>

            {/* Preview Modal */}
            <Dialog
                open={previewOpen}
                onClose={handlePreviewClose}
                sx={{
                    '& .MuiDialog-paper': {
                        width: '750px',
                        maxHeight: '80%',
                        margin: 'auto',
                    },
                }}
            >
                <DialogTitle>Exam Preview</DialogTitle>
                <DialogContent>
                    <Typography variant="h6">Title: {title}</Typography>
                    <Typography variant="h6">Course: {selectedCourse}</Typography>
                    <Typography variant="h6">Year Level: {selectedYearLevel}</Typography>
                    <Typography variant="h6">Subjects: {selectedSubjects.join(', ')}</Typography>

                    {/* Dropdown for selecting question type */}
                    <select onChange={(e) => setSelectedType(e.target.value)} value={selectedType}>
                        <option value="All">All</option>
                        <option value="Worded Problem">Worded Problem</option>
                        <option value="Multiple Choice">Multiple Choice</option>
                        <option value="Essay">Essay</option>
                        <option value="True or False">True or False</option>
                        <option value="Identification">Identification</option>
                    </select>

                    <Typography variant="h6">Topics:</Typography>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {topics.map((topic, topicIndex) => {
                            // Check if there are any questions in the topic
                            const hasQuestions = selectedQuestions[topicIndex]?.easy.length > 0 ||
                                selectedQuestions[topicIndex]?.intermediate.length > 0 ||
                                selectedQuestions[topicIndex]?.difficult.length > 0;

                            if (!hasQuestions) return null; // Skip topics with no questions

                            return (
                                <li key={topicIndex}>
                                    <Typography variant="subtitle1" component="span" style={{ fontWeight: 'bold' }}>
                                        {topic.topicName}
                                    </Typography>
                                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                                        {/* Display Easy Questions */}
                                        {filterQuestionsByType(selectedQuestions[topicIndex]?.easy || []).map((question, questionIndex) => (
                                            <li key={`easy-${topicIndex}-${questionIndex}`}>
                                                <Typography variant="body2">
                                                    <strong>{questionIndex + 1}. {question.questionText}</strong>
                                                </Typography>
                                                {/* Display choices only for multiple-choice questions */}
                                                {question.type === 'Multiple Choice' && (
                                                    <ul style={{ listStyleType: 'none', padding: 0, paddingLeft: '20px', fontSize: "small" }}>
                                                        {question.choices.map((choice, choiceIndex) => (
                                                            <li key={`easy-choice-${topicIndex}-${questionIndex}-${choiceIndex}`}>
                                                                {getChoiceLabel(choiceIndex)}. {choice} {choice === question.answer && "(Correct)"}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {/* Display answer for other question types without <li> */}
                                                {['True or False', 'Identification', 'Worded Problem', 'Essay'].includes(question.type) && (
                                                    <Typography style={{ paddingLeft: '20px', fontSize: "small" }}>
                                                        Answer: {question.answer}
                                                    </Typography>
                                                )}
                                            </li>
                                        ))}
                                        {/* Display Intermediate Questions */}
                                        {filterQuestionsByType(selectedQuestions[topicIndex]?.intermediate || []).map((question, questionIndex) => (
                                            <li key={`intermediate-${topicIndex}-${questionIndex}`}>
                                                <Typography variant="body2">
                                                    <strong>{questionIndex + 1 + (selectedQuestions[topicIndex]?.easy?.length || 0)}. {question.questionText}</strong>
                                                </Typography>
                                                {/* Display choices only for multiple-choice questions */}
                                                {question.type === 'Multiple Choice' && (
                                                    <ul style={{ listStyleType: 'none', padding: 0, paddingLeft: '20px', fontSize: "small" }}>
                                                        {question.choices.map((choice, choiceIndex) => (
                                                            <li key={`intermediate-choice-${topicIndex}-${questionIndex}-${choiceIndex}`}>
                                                                {getChoiceLabel(choiceIndex)}. {choice} {choice === question.answer && "(Correct)"}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {/* Display answer for other question types without <li> */}
                                                {['True or False', 'Identification', 'Worded Problem', 'Essay'].includes(question.type) && (
                                                    <Typography style={{ paddingLeft: '20px', fontSize: "small" }}>
                                                        Answer: {question.answer}
                                                    </Typography>
                                                )}
                                            </li>
                                        ))}
                                        {/* Display Difficult Questions */}
                                        {filterQuestionsByType(selectedQuestions[topicIndex]?.difficult || []).map((question, questionIndex) => (
                                            <li key={`difficult-${topicIndex}-${questionIndex}`}>
                                                <Typography variant="body2">
                                                    <strong>{questionIndex + 1 + (selectedQuestions[topicIndex]?.easy?.length || 0) + (selectedQuestions[topicIndex]?.intermediate?.length || 0)}. {question.questionText}</strong>
                                                </Typography>
                                                {/* Display choices only for multiple-choice questions */}
                                                {question.type === 'Multiple Choice' && (
                                                    <ul style={{ listStyleType: 'none', padding: 0, paddingLeft: '20px', fontSize: "small" }}>
                                                        {question.choices.map((choice, choiceIndex) => (
                                                            <li key={`difficult-choice-${topicIndex}-${questionIndex}-${choiceIndex}`}>
                                                                {getChoiceLabel(choiceIndex)}. {choice} {choice === question.answer && "(Correct)"}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {/* Display answer for other question types without <li> */}
                                                {['True or False', 'Identification', 'Worded Problem', 'Essay'].includes(question.type) && (
                                                    <Typography style={{ paddingLeft: '20px', fontSize: "small" }}>
                                                        Answer: {question.answer}
                                                    </Typography>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            );
                        })}
                    </ul>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handlePreviewClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CreateExam;
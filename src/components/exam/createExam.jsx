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
    Button
} from '@mui/material';
import { useCoursesContext } from '../../hooks/useCourseContext';

const CreateExam = () => {
    const [title, setTitle] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedYearLevel, setSelectedYearLevel] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [topics, setTopics] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState({});
    const [errors, setErrors] = useState({});

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

    const handleCourseChange = (event) => {
        const courseName = event.target.value;
        setSelectedCourse(courseName);
        setErrors((prev) => ({ ...prev, course: '' })); // Clear error

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

        const selectedCourseData = courses.find(course => course.courseName === selectedCourse);
        if (selectedCourseData) {
            const yearLevelData = selectedCourseData.yearLevels.find(yl => yl.year === yearLevel);
            if (yearLevelData) {
                setSubjects(yearLevelData.subjects);
            }
        }
    };

    const handleSubjectChange = (event) => {
        const subject = event.target.value;
        setSelectedSubject(subject);
        setErrors((prev) => ({ ...prev, subject: '' })); // Clear error

        const subjectData = subjects.find(sub => sub.subjectName === subject);
        if (subjectData) {
            const updatedTopics = subjectData.topics.map(topic => {
                const difficultyCount = { easy: 0, medium: 0, hard: 0, total: 0 };

                topic.questions.forEach(question => {
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
                    difficultyCount
                };
            });

            setTopics(updatedTopics);
        }
    };

    const handleSubmit = async () => {
        const newErrors = {};
        if (!title) newErrors.title = "Title is required";
        if (!selectedCourse) newErrors.course = "Course is required";
        if (!selectedYearLevel) newErrors.yearLevel = "Year Level is required";
        if (!selectedSubject) newErrors.subject = "Subject is required";

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            const examData = topics.map((topic, index) => ({
                topicName: topic.topicName,
                selectedQuestions: selectedQuestions[index] || { easy: [], intermediate: [], difficult: [] }
            }));

            const examSummary = {
                title,
                course: selectedCourse,
                yearLevel: selectedYearLevel,
                subject: selectedSubject,
                topics: examData
            };

            console.log(examSummary);

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

                const data = await response.json();
                console.log('Exam created successfully:', data);
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

        const selected = questionsForDifficulty.slice(0, count);
        setSelectedQuestions(prevSelectedQuestions => {
            const updatedSelection = { ...prevSelectedQuestions };
            if (!updatedSelection[topicIndex]) {
                updatedSelection[topicIndex] = {
                    easy: [],
                    intermediate: [],
                    difficult: []
                };
            }
            updatedSelection[topicIndex][difficulty] = selected;
            return updatedSelection;
        });
    };

    return (
        <>
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

            {/* Subject Select */}
            <FormControl required sx={{ minWidth: 300, mr: 3 }} disabled={!selectedYearLevel || subjects.length === 0} error={!!errors.subject}>
                <InputLabel id="select-subject-label">Subject</InputLabel>
                <Select
                    labelId="select-subject-label"
                    id="select-subject"
                    value={selectedSubject || ''}
                    label="Subject"
                    onChange={handleSubjectChange}
                >
                    {subjects.map((subject, index) => (
                        <MenuItem key={index} value={subject.subjectName}>
                            {subject.subjectName}
                        </MenuItem>
                    ))}
                </Select>
                {errors.subject && <p style={{ color: 'red' }}>{errors.subject}</p>}
            </FormControl>
            <br />
            <br />

            {/* Table of Topics */}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="topics table">
                    <TableHead>
                        <TableRow>
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
                                <TableCell>{topic.topicName}</TableCell>

                                {/* Easy Dropdown */}
                                <TableCell>
                                    <FormControl sx={{ minWidth: 100 }}>
                                        <Select
                                            value={selectedQuestions[index]?.easy?.length || 0}
                                            onChange={(e) => handleSelectChange(index, 'easy', e.target.value)}
                                        >
                                            {[...Array(topic.questions.filter(q => q.difficulty.toLowerCase() === 'easy').length + 1)].map((_, i) => (
                                                <MenuItem key={i} value={i}>{i}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </TableCell>

                                {/* Intermediate Dropdown */}
                                <TableCell>
                                    <FormControl sx={{ minWidth: 100 }}>
                                        <Select
                                            value={selectedQuestions[index]?.intermediate?.length || 0}
                                            onChange={(e) => handleSelectChange(index, 'intermediate', e.target.value)}
                                        >
                                            {[...Array(topic.questions.filter(q => q.difficulty.toLowerCase() === 'intermediate').length + 1)].map((_, i) => (
                                                <MenuItem key={i} value={i}>{i}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </TableCell>

                                {/* Difficult Dropdown */}
                                <TableCell>
                                    <FormControl sx={{ minWidth: 100 }}>
                                        <Select
                                            value={selectedQuestions[index]?.difficult?.length || 0}
                                            onChange={(e) => handleSelectChange(index, 'difficult', e.target.value)}
                                        >
                                            {[...Array(topic.questions.filter(q => q.difficulty.toLowerCase() === 'difficult').length + 1)].map((_, i) => (
                                                <MenuItem key={i} value={i}>{i}</MenuItem>
                                            ))}
                                        </Select>
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
            <Button variant="outlined" color="primary" onClick={handleSubmit}>
                Create Exam
            </Button>
        </>
    );
};

export default CreateExam;

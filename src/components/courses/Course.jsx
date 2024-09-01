import React, { useState } from 'react';
import Questions from './modal/questions'
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AddIcon from '@mui/icons-material/Add';

const CoursesList = ({ course }) => {
    const [modalIsOpen, setIsOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState("");
    const [openedFolders, setOpenedFolders] = useState({});
    const [openedTopics, setOpenedTopics] = useState({});
    const [activeTopic, setActiveTopic] = useState(null); // To track the active topic

    const openModal = () => {
        console.log('Opening modal');
        setIsOpen(true);
    }
    const closeModal = () => {
        setIsOpen(false);
    }

    // Find the yearLevel object that matches the selectedYear
    const selectedYearLevel = course.yearLevels.find(
        (yearLevel) => yearLevel.year === selectedYear
    );
    const toggleFolder = (folderName) => {
        setOpenedFolders((prev) => ({
            ...prev,
            [folderName]: !prev[folderName],
        }));
    };
    const handleTopicClick = (topicName) => {
        console.log(`Clicked topic: ${topicName}`);

        setOpenedTopics((prev) => ({ ...prev, [topicName]: true })); // Mark the topic as opened
        setActiveTopic(topicName); // Set the active topic to the clicked one
        openModal(); // Always open the modal when a topic is clicked
    };


    return (
        <div className="workout-details" style={{ display: "flex" }}>
            <div style={{ marginRight: "50px" }}>
                <h4>Course: {course.courseName}</h4>
                <p className="desc">Description: <strong>{course.desc}</strong></p>
                <br />
                <div className="dropdown-container">
                    <select
                        className="styled-dropdown"
                        name="Year Level"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option value="" disabled>
                            Select Year Level
                        </option>
                        {course.yearLevels.map((yearLevel) => (
                            <option key={yearLevel.year} value={yearLevel.year}>
                                {yearLevel.year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Render subjects if a year level is selected */}
                {selectedYearLevel && (
                    <div>
                        <h5>Subjects for {selectedYearLevel.year} </h5>
                        <ul>
                            {selectedYearLevel.subjects.map((subject) => (
                                <li
                                    key={subject._id}
                                    style={{ cursor: "pointer", listStyle: "none" }}
                                    onClick={() => toggleFolder(subject.subjectName)}
                                >

                                    {/* Toggle folder icon based on open state */}
                                    {openedFolders[subject.subjectName] ? <ArrowDropDownIcon style={{ position: "absolute", left: '35px' }} /> : <ArrowRightIcon style={{ position: "absolute", left: '35px' }} />} {subject.subjectName}
                                    <button
                                        style={{ display: 'inline-block', marginLeft: '10px' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log(`Button clicked for ${subject.subjectName}`);
                                        }}
                                    >
                                        Add topic
                                    </button>
                                    {openedFolders[subject.subjectName] && (
                                        <ul style={{ marginLeft: "24px", marginTop: "8px" }}>
                                            {subject.topics.map((topic) => (
                                                <li
                                                    key={topic._id}
                                                    className="topics"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent closing subject
                                                    }}
                                                >
                                                    {/* Topic name */}
                                                    {topic.topicName}<button
                                                        style={{ display: 'inline-block', marginLeft: '10px', padding: '0px', height: '24px' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleTopicClick(topic.topicName); // Handle topic click
                                                        }}
                                                    >
                                                        <AddIcon style={{height: '20px', width: '20px'}}/>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            {modalIsOpen && (
                <Questions
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    activeTopic={activeTopic}
                    selectedYearLevel={selectedYearLevel}
                />
            )}
        </div>
    );
};

export default CoursesList;

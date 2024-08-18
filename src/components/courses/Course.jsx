import React, { useState } from 'react';

const CoursesList = ({ course }) => {
    console.log(course);
    const [selectedYear, setSelectedYear] = useState("");
    const [openedFolders, setOpenedFolders] = useState({});
    const [openedTopics, setOpenedTopics] = useState({});
    const [activeTopic, setActiveTopic] = useState(null); // To track the active topic

    // Find the yearLevel object that matches the selectedYear
    const selectedYearLevel = course.yearLevels.find(
        (yearLevel) => yearLevel.year === selectedYear
    );

    // Function to convert year number to ordinal string
    const getOrdinal = (num) => {
        const suffixes = ["th", "st", "nd", "rd"];
        const v = num % 100;
        return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    };

    // Toggle folder open/close state for subjects
    const toggleFolder = (folderName) => {
        setOpenedFolders((prev) => ({
            ...prev,
            [folderName]: !prev[folderName],
        }));
    };

    // Handle topic click
    const handleTopicClick = (topicName) => {
        if (!openedTopics[topicName]) { // Ensure topic is only clickable once
            setOpenedTopics({ [topicName]: true }); // Set the clicked topic as open
            setActiveTopic(topicName); // Set the active topic to the clicked one
        }
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
                        <h5>Subjects for {getOrdinal(selectedYearLevel.year)} Year:</h5>
                        <ul>
                            {selectedYearLevel.subjects.map((subject) => (
                                <li 
                                    key={subject._id} 
                                    style={{ cursor: "pointer", listStyle: "none" }}
                                    onClick={() => toggleFolder(subject.subjectName)}
                                > 
                                    <br />
                                    {/* Toggle folder icon based on open state */}
                                    {openedFolders[subject.subjectName] ? "📂" : "📁"} {subject.subjectName} <p style={{display: 'inline-block'}}><strong> +</strong></p>
                                    {openedFolders[subject.subjectName] && (
                                        <ul style={{ marginLeft: "24px", marginTop: "8px" }}>
                                            {subject.topics.map((topic) => (
                                                <li 
                                                    key={topic._id} 
                                                    className="topics" 
                                                    style={{ cursor: "pointer" }}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent closing subject
                                                        handleTopicClick(topic.topicName); // Handle topic click
                                                    }} 
                                                > 
                                                    {/* Topic name */}
                                                    {topic.topicName} <p style={{display: 'inline-block'}}><strong> +</strong></p>
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
            
            {/* Render questions for the active topic */}
            {activeTopic && (
                <div style={{ marginLeft: "24px", marginTop: "142px" }}>
                    <h5>Questions:</h5>
                    {selectedYearLevel.subjects.map((subject) =>
                        subject.topics.map((topic) =>
                            activeTopic === topic.topicName && (
                                <ul key={topic._id} style={{ marginLeft: "24px" }}>
                                    {topic.questions.map((question, index) => (
                                        <li key={question._id} style={{ listStyle: "none" }}>
                                            {index + 1}. {question.questionText}
                                        </li>
                                    ))}
                                </ul>
                            )
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default CoursesList;

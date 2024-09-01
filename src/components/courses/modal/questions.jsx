// MyModal.js
import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function Questions({ isOpen, onRequestClose, activeTopic, selectedYearLevel }) {
    console.log(selectedYearLevel);
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={{
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                },
                content: {
                    color: 'black',
                    padding: '20px',
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    height: '80%'
                },
            }}
        >
            <strong>Topic: {activeTopic} </strong><br /><br />
            {selectedYearLevel.subjects.map((subject) =>
                subject.topics.map((topic) =>
                    activeTopic === topic.topicName && (
                        <ul key={topic._id} style={{ marginLeft: "24px" }}>
                            {topic.questions.map((question, index) => (
                                <li key={question._id} style={{ listStyle: "none" }}>
                                    <strong>{index + 1}. {question.questionText}</strong>
                                    <ul>
                                        {question.choices.map((choice, index) => (
                                            <li style={{ listStyle: "none" }}>
                                                {String.fromCharCode(65 + index)}. {choice}
                                            </li>
                                        ))}
                                    </ul>
                                    <br />
                                </li>
                            ))}
                        </ul>
                    )
                )
            )}
            <button onClick={onRequestClose}>Close</button>
        </Modal>
    );
}

export default Questions;

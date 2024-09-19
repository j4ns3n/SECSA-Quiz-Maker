
const Course = require('../models/course')
const mongoose = require('mongoose')

//get all workouts

const getCourses = async (req, res) => {
    const course = await Course.find({}).sort({ createAt: -1 })

    res.status(200).json(course)
}

//get a single workout
const getCourse = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such course' })
    }

    const course = await Course.findById(id)

    if (!course) {
        return res.status(404).json({ error: "No such course" })
    }

    res.status(200).json(course)
}

//create new wokrout
const createCourse = async (req, res) => {
    const { title, load, reps } = req.body

    //add doc to db
    try {
        const course = await Course.create({ title, load, reps })
        res.status(200).json(course)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}


//delete a workout
const deleteCourse = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such Course' })
    }

    const course = await Course.findByIdAndDelete({ _id: id })

    if (!course) {
        return res.status(400).json({ error: "No such Course" })
    }

    res.status(200).json(course)
}

//update a workout

const updateCourse = async (req, res) => {

    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such Course' })
    }

    const course = await Course.findByIdAndUpdate({ _id: id }, {
        ...req.body
    })

    if (!course) {
        return res.status(400).json({ error: "No such Course" })
    }

    res.status(200).json(course)
}


const addTopicToSubject = async (req, res) => {
    const { courseId, year, subjectName } = req.params;
    const { topicName, topicDesc, questions } = req.body;  // Destructure topic fields from the request body

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const yearLevel = course.yearLevels.find(y => y.year === year);

        if (!yearLevel) {
            return res.status(404).json({ message: 'Year level not found' });
        }

        const subject = yearLevel.subjects.find(s => s.subjectName === subjectName);

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Create a new topic
        const newTopic = { topicName, topicDesc, questions };

        // Push the new topic to the subject's topics array
        subject.topics.push(newTopic);

        // Save the course document
        await course.save();

        // Get the newly added topic (last in the array)
        const addedTopic = subject.topics[subject.topics.length - 1];

        // Return the added topic with its _id
        res.status(200).json({ newTopic: addedTopic });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



const deleteTopic = async (req, res) => {
    try {
        const { courseId, year, subjectName, topicId } = req.params;

        // Find the course by ID
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Find the year level
        const yearLevel = course.yearLevels.find(y => y.year === year);

        if (!yearLevel) {
            return res.status(404).json({ message: 'Year level not found' });
        }

        // Find the subject
        const subject = yearLevel.subjects.find(s => s.subjectName === subjectName);

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Remove the topic by its _id
        subject.topics = subject.topics.filter(topic => topic._id.toString() !== topicId);

        // Save the updated course document
        await course.save();

        res.status(200).json({ message: 'Topic deleted successfully', updatedTopics: subject.topics });
    } catch (error) {
        console.error('Error deleting topic:', error);
        res.status(500).json({ message: 'Server error' });
    }

};


const updateTopic = async (req, res) => {
    const { courseId, year, subjectName, topicId } = req.params;
    const updatedTopic = req.body;

    console.log(courseId, year, subjectName, topicId);

    try {
        // Find the course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Find the year level
        const yearLevel = course.yearLevels.find(y => y.year === year);
        if (!yearLevel) {
            return res.status(404).json({ message: 'Year level not found' });
        }

        // Find the subject
        const subject = yearLevel.subjects.find(s => s.subjectName === subjectName);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Find the topic and update it
        const topicIndex = subject.topics.findIndex(t => t._id.toString() === topicId);
        if (topicIndex === -1) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        // Update the topic
        subject.topics[topicIndex] = { ...subject.topics[topicIndex]._doc, ...updatedTopic };

        // Save the course
        await course.save();

        // Respond with updated topic
        res.status(200).json({ updatedTopic: subject.topics[topicIndex] });
    } catch (error) {
        console.error('Update topic error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const addQuestionToTopic = async (req, res) => {
    const { courseId, year, subjectName, topicName } = req.params;
    const { type, difficulty, questionText, choices, answer } = req.body;

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const yearLevel = course.yearLevels.find(y => y.year === year);

        if (!yearLevel) {
            return res.status(404).json({ message: 'Year level not found' });
        }

        const subject = yearLevel.subjects.find(s => s.subjectName === subjectName);

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        const topic = subject.topics.find(t => t.topicName === topicName);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        // Create a new question
        const newQuestion = { type, difficulty, questionText, choices, answer };

        // Push the new question to the topic's questions array
        topic.questions.push(newQuestion);

        // Save the course document
        await course.save();

        // Get the newly added question (last in the array)
        const addedQuestion = topic.questions[topic.questions.length - 1];

        // Return the added question with its _id
        res.status(200).json({ newQuestion: addedQuestion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const deleteQuestion = async (req, res) => {
    try {
        const { courseId, year, subjectName, topicName, questionId } = req.params;
        console.log('Deleting question:', questionId);

        // Fetch the course by ID
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Find the year level
        const yearLevel = course.yearLevels.find(y => y.year === year);
        if (!yearLevel) {
            return res.status(404).json({ message: 'Year level not found' });
        }

        // Find the subject
        const subject = yearLevel.subjects.find(s => s.subjectName === subjectName);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Find the topic
        const topic = subject.topics.find(t => t.topicName === topicName);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        // Remove the question by its _id
        topic.questions = topic.questions.filter(q => q._id.toString() !== questionId);

        // Save the updated course document
        await course.save();

        res.status(200).json({ message: 'Question deleted successfully', updatedQuestions: topic.questions });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const updateQuestion = async (req, res) => {
    const { courseId, year, subjectName, topicName, questionId } = req.params;
    const updatedQuestion = req.body; // Updated question details

    try {
        // Fetch the course by ID
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Find the year level
        const yearLevel = course.yearLevels.find(y => y.year === year);
        if (!yearLevel) {
            return res.status(404).json({ message: 'Year level not found' });
        }

        // Find the subject
        const subject = yearLevel.subjects.find(s => s.subjectName === subjectName);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Find the topic
        const topic = subject.topics.find(t => t.topicName === topicName);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        // Find the question within the topic
        const questionIndex = topic.questions.findIndex(q => q._id.toString() === questionId);
        if (questionIndex === -1) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Update the question
        topic.questions[questionIndex] = { 
            ...topic.questions[questionIndex].toObject(),  // Spread existing question
            ...updatedQuestion  // Merge updated fields
        };

        // Save the course
        await course.save();

        // Respond with the updated question
        res.status(200).json({ updatedQuestion: topic.questions[questionIndex] });
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};






module.exports = {
    getCourses,
    getCourse,
    updateCourse,
    createCourse,
    deleteCourse,
    addTopicToSubject,
    deleteTopic,
    updateTopic,
    addQuestionToTopic,
    deleteQuestion,
    updateQuestion
}
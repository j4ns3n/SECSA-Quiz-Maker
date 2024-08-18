const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseName: {type: String, required: true},
    desc: {type: String, required: true},
    yearLevels: [
        {
            year: {type: String},
            subjects: [
                {
                    subjectName: {type: String},
                    topics: [
                        {
                            topicName: {type: String},
                            questions: [
                                {
                                    questionText: {type: String},
                                    choices: [],
                                    answer: {type: Number}
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});

module.exports = mongoose.model('Course', courseSchema);
const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new mongoose.Schema({
    courseName: {type: String, required: true},
    desc: {type: String, required: true},
    yearLevels: [
        {
            year: {type: String},
            subjects: [
                {
                    subjectCode: {type: String},
                    subjectName: {type: String},
                    topics: [
                        {
                            topicName: {type: String},
                            topicDesc: {type: String},
                            questions: [
                                {
                                    type: {type: String},
                                    difficulty: {type: String},
                                    questionText: {type: String},
                                    choices: [{type: String}],
                                    answer: { type: Schema.Types.Mixed }
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


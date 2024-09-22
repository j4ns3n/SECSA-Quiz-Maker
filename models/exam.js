const mongoose = require('mongoose');
const { Schema } = mongoose;

const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    course: { type: String, required: true },
    yearLevel: { type: String, required: true },
    subject: { type: String, required: true },
    topics: [
        {
            topicName: { type: String, required: true },
            selectedQuestions: {
                easy: [{
                    type: { type: String },
                    difficulty: { type: String },
                    questionText: { type: String },
                    choices: [{ type: String }],
                    answer: { type: Schema.Types.Mixed }
                }],
                intermediate: [{
                    type: { type: String },
                    difficulty: { type: String },
                    questionText: { type: String },
                    choices: [{ type: String }],
                    answer: { type: Schema.Types.Mixed }
                }],
                difficult: [{
                    type: { type: String },
                    difficulty: { type: String },
                    questionText: { type: String },
                    choices: [{ type: String }],
                    answer: { type: Schema.Types.Mixed }
                }],
            },
        },
    ],
});

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;

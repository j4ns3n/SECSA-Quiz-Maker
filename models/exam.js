const mongoose = require('mongoose');
const { Schema } = mongoose;

const participantSchema = new Schema({
    name: { type: String, required: true }, 
    email: { type: String },
    course: { type: String }
});

const examSchema = new Schema({
    title: { type: String, required: true },
    examCode: { type: String, required: true },
    course: { type: String, required: true },
    yearLevel: { type: String, required: true },
    subject: { type: [String], required: true },
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
    participants: [participantSchema], 
    totalQuestions: { type: Number, default: 0 }, 
});

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;

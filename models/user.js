const mongoose = require('mongoose')

const Schema = mongoose.Schema

// const examSchem = new Schema({

// });

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String
    },
    role: {
        type: String
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    course: {
        type: String
    },
    yearLevel: {
        type: String
    },
    // examx: [examSchem]
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)

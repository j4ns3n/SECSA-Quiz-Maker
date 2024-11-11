require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose')
const workoutRoutes = require('./routes/workouts')
const courseRoutes = require('./routes/course')
const userRoutes = require('./routes/user')
const examRoutes = require('./routes/exam')
const cors = require('cors');
const app = express();

app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
})

app.use(cors());


app.use('/api/workouts', workoutRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/user', userRoutes)
app.use('/api/exams', examRoutes)

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, '0.0.0.0', () => {
            console.log('connected to db & listening on port', process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })



const Course = require('../models/course')
const mongoose = require('mongoose')

//get all workouts

const getCourses = async (req, res) => {
    const course = await Course.find({}).sort({createAt: -1})

    res.status(200).json(course) 
}

//get a single workout
const getCourse = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such course'})
    }

    const course = await Course.findById(id)

    if(!course) {
        return res.status(404).json({error: "No such course"})
    }

    res.status(200).json(course)
}

//create new wokrout
const createCourse = async (req, res) => {
    const {title, load, reps} = req.body

    //add doc to db
    try{
        const course = await Course.create({title, load, reps})
        res.status(200).json(course)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}


//delete a workout
const deleteCourse = async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such Course'})
    }

    const course = await Course.findByIdAndDelete({_id: id})

    if(!course) {
        return res.status(400).json({error: "No such Course"})
    }

    res.status(200).json(course)
}

//update a workout

const updateCourse = async (req, res) => {
    
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such Course'})
    }

    const course = await Course.findByIdAndUpdate({_id: id}, {
        ...req.body
    })

    if(!course) {
        return res.status(400).json({error: "No such Course"})
    }

    res.status(200).json(course)
}


module.exports = {
    getCourses,
    getCourse,
    updateCourse,
    createCourse,
    deleteCourse
}
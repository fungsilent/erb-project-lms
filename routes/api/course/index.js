import mongoose from 'mongoose'
import User from '#root/db/models/User'
import Course from '#root/db/models/Course'

export default (app, utils) => {
    // Get course list (GET)
    app.get('/api/course', async (req, res) => {
        let query = {}
        try {
            switch (req.user.role) {
                // case 'superAdmin':
                // case 'admin': {
                //     break
                // }
                case 'teacher': {
                    query = { teacher: req.user._id }
                    break
                }
                case 'student': {
                    query = { students: req.user._id }
                    break
                }
            }
            const courses = await Course.find(query).populate('teacher')
            utils.sendSuccess(res, courses)
        } catch (err) {
            utils.sendError(res, 'Courses not found')
        }
    })

    // get course option data (GET)
    app.get('/api/course/option', async (req, res) => {
        try {
            const teachers = await User.find({
                role: { $in: ['teacher', 'admin', 'superAdmin'] },
            })
            const students = await User.find({ role: 'student' })
            utils.sendSuccess(res, { teachers, students })
        } catch (err) {
            console.log(err)
            utils.sendError(res, 'Course data not found')
        }
    })

    // get course detail (GET)
    app.get('/api/course/:id', async (req, res) => {
        try {
            const course = await Course.findById(req.params.id).populate(
                'teacher students'
            )
            if (!course) {
                throw new Error('Course not found')
            }
            utils.sendSuccess(res, course)
        } catch (err) {
            console.log(err)
            utils.sendError(res, err.message)
        }
    })

    // Add course (POST)
    app.post('/api/course/add', async (req, res) => {
        const {
            name,
            description,
            teacher,
            startDate,
            endDate,
            maxStudents,
            excludeDates,
            students,
        } = req.body
        const parsedExcludeDates = excludeDates
            ? excludeDates.split(',').map(date => new Date(date.trim()))
            : []
        const parsedStudents = Array.isArray(students)
            ? students.map(id => new mongoose.Types.ObjectId(id.trim()))
            : []

        try {
            const newCourse = new Course({
                name,
                description,
                teacher,
                startDate,
                endDate,
                maxStudents,
                excludeDates: parsedExcludeDates,
                students: parsedStudents,
            })
            await newCourse.save()
            utils.sendSuccess(res)
        } catch (err) {
            console.error('Error adding course:', err)
            utils.sendError(res, 'Add course failed')
        }
    })

    // Update course (POST)
    app.put('/api/course/:id', async (req, res) => {
        const {
            name,
            description,
            teacher,
            startDate,
            endDate,
            maxStudents,
            excludeDates,
            students,
        } = req.body
        const excludeDatesArray = excludeDates
            ? excludeDates.split(',').map(date => new Date(date.trim()))
            : []

        try {
            const studentsArray = students.map(id => new mongoose.Types.ObjectId(id))
            const updatedCourse = await Course.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    description,
                    teacher,
                    startDate,
                    endDate,
                    maxStudents,
                    excludeDates: excludeDatesArray,
                    students: studentsArray,
                },
                { new: true }
            )
            if (!updatedCourse) {
                return utils.sendError(res, 'Course not found')
            }
            utils.sendSuccess(res)
        } catch (err) {
            console.error('Error adding course:', err)
            utils.sendError(res, 'Update course failed')
        }
    })

    // Delete user (POST)
    app.delete('/api/course/:id', async (req, res) => {
        try {
            const deletedCourse = await Course.findByIdAndDelete(req.params.id)
            if (!deletedCourse) {
                return utils.sendError(res, 'Course not found')
            }
            utils.sendSuccess(res)
        } catch (err) {
            console.error('Error deleting course:', err)
            utils.sendError(res, 'Delete course failed')
        }
    })
}

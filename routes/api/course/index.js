import Course from '#root/db/models/Course'
import mongoose from 'mongoose'

export default (app, utils) => {
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
            res.redirect('/course')
        } catch (err) {
            console.error('Error adding course:', err)
            res.status(500).json({
                success: false,
                message: 'Error adding course',
                error: err.message,
            })
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
        const studentsArray = students
            ? students
                  .split(',')
                  .map(id => new mongoose.Types.ObjectId(id.trim()))
            : []

        try {
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
                return res
                    .status(404)
                    .render('error', { message: 'Course not found' })
            }
            res.status(200).json({
                success: true,
                message: 'Course Update successfully',
            })
        } catch (err) {
            console.error('Error updating course:', err)
            res.status(500).render('error', {
                message: 'Error updating course',
            })
        }
    })

    // Delete user (POST)
    app.delete('/api/course/:id', async (req, res) => {
        try {
            const deletedCourse = await Course.findByIdAndDelete(req.params.id)
            if (!deletedCourse) {
                return res
                    .status(404)
                    .json({ success: false, message: 'Course not found' })
            }
            res.status(200).json({
                success: true,
                message: 'Course deleted successfully',
            })
        } catch (err) {
            console.error('Error deleting course:', err)
            res.status(500).json({
                success: false,
                message: 'Error deleting course',
                error: err.message,
            })
        }
    })
}

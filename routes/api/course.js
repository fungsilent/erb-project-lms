import mongoose from 'mongoose';
import Course from '#root/db/models/Course';
import User from '#root/db/models/User';
import Assignment from '#root/db/models/Assignment';
import Attendance from '#root/db/models/Attendance';

export default (app, utils) => {
    // Get course list (GET)
    app.get('/api/course', async (req, res) => {
        let query = {};
        try {
            switch (req.user.role) {
                case 'teacher':
                    query = { teacher: req.user._id };
                    break;
                case 'student':
                    query = { students: req.user._id };
                    break;
            }
            const courses = await Course.find(query).populate('teacher');
            utils.sendSuccess(res, courses);
        } catch (err) {
            utils.sendError(res, 'Courses not found');
        }
    });

    // get course option data (GET)
    app.get('/api/course/option', async (req, res) => {
        try {
            const teachers = await User.find({
                role: { $in: ['teacher', 'admin', 'superAdmin'] },
            });
            const students = await User.find({ role: 'student' });
            utils.sendSuccess(res, { teachers, students });
        } catch (err) {
            console.log(err);
            utils.sendError(res, 'Course data not found');
        }
    });

    // get course detail (GET)
    app.get('/api/course/:id', async (req, res) => {
        try {
            const course = await Course.findById(req.params.id).populate('teacher students');
            if (!course) {
                throw new Error('Course not found');
            }
            utils.sendSuccess(res, course);
        } catch (err) {
            console.log(err);
            utils.sendError(res, err.message);
        }
    });

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
            color, //add course color
        } = req.body;
        const parsedExcludeDates = excludeDates
            ? excludeDates.split(',').map(date => new Date(date.trim()))
            : [];
        const parsedStudents = Array.isArray(students)
            ? students.map(id => new mongoose.Types.ObjectId(id.trim()))
            : [];

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
                color, //add course color
            });
            await newCourse.save();
            res.status(200).json({ success: true, message: 'Course added successfully' });
        } catch (err) {
            console.error('Error adding course:', err);
            res.status(500).json({
                success: false,
                message: 'Error adding course',
                error: err.message,
            });
        }
    });

    // Update course (PUT)
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
            color, //add course color
        } = req.body;
        const excludeDatesArray = excludeDates
            ? excludeDates.split(',').map(date => new Date(date.trim()))
            : [];
        const studentsArray = Array.isArray(students)
        ? students.map(id => new mongoose.Types.ObjectId(id.trim()))
        : [];

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
                    color, //add course color
                },
                { new: true }
            );
            if (!updatedCourse) {
                return res.status(404).json({ success: false, message: 'Course not found' });
            }
            res.status(200).json({
                success: true,
                message: 'Course updated successfully',
            });
        } catch (err) {
            console.error('Error updating course:', err);
            res.status(500).json({
                success: false,
                message: 'Error updating course',
                error: err.message,
            });
        }
    });

    // Delete course (DELETE)
    app.delete('/api/course/:id', async (req, res) => {
        try {
            const deletedCourse = await Course.findByIdAndDelete(req.params.id);
            if (!deletedCourse) {
                return res
                    .status(404)
                    .json({ success: false, message: 'Course not found' });
            }
            res.status(200).json({
                success: true,
                message: 'Course deleted successfully',
            });
        } catch (err) {
            console.error('Error deleting course:', err);
            res.status(500).json({
                success: false,
                message: 'Error deleting course',
                error: err.message,
            });
        }
    });

    // course details (GET)
    app.get('/api/course/details/:courseId', async (req, res) => {
        try {
            const courseId = req.params.courseId;
    
            const course = await Course.findById(courseId)
                .populate('teacher')
                .populate('students')
                .lean();
    
            const assignments = await Assignment.find({ courseId })
                .populate('results.studentId')
                .lean();
    
            const attendanceRecords = await Attendance.find({ course: courseId })
                .populate('student')
                .lean();
    
            res.status(200).json({
                success: true,
                course,
                assignments,
                attendanceRecords
            });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching course details', error: err.message });
        }
    });
};

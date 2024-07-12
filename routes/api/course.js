import mongoose from 'mongoose';
import _ from 'lodash'
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
            utils.sendSuccess(res, course);
        } catch (err) {
            console.error('Error adding course:', err);
            utils.sendError(res, 'Error adding course');
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
                return utils.sendError(res, 'Course not found')
            }
            utils.sendSuccess(res);
        } catch (err) {
            console.error('Error updating course:', err);
            utils.sendError(res, 'Error updating course');
        }
    });

    // Delete course (DELETE)
    app.delete('/api/course/:id', async (req, res) => {
        try {
            const deletedCourse = await Course.findByIdAndDelete(req.params.id);
            if (!deletedCourse) {
                return utils.sendError(res, 'Course not found');
            }
            utils.sendError(res);
        } catch (err) {
            console.error('Error deleting course:', err);
            utils.sendError(res, 'Error deleting course');
        }
    });

    // course details (GET)
    app.get('/api/course/details/:id', async (req, res) => {
        try {
            const courseId = req.params.id;
    
            const course = await Course.findById(courseId)
                .populate('teacher')
                .populate('students')
                .lean();
            const assignments = await Assignment.find({ courseId }).lean()
            const attendances = await Attendance.find({ course: courseId }).lean()

            // assignments list
            const assignmentsData = assignments.map(assignment => {
                return {
                    ..._.pick(assignment, ['_id', 'name', 'marks', 'dueDate', 'fileUrl']),
                    avgMarks: _.sumBy(assignment.results, 'marks') / assignment.totalMarks,
                    markedCount: _.chain(assignment.results).countBy(item => !!item.marks).get('true').value() || 0,
                    submittedCount: _.chain(assignment.results).countBy(item => !!item.studentFileUrl).get('true').value() || 0,
                    status: {
                        passed: _.chain(assignment.results).countBy(item => item.marks >= assignment.passingMarks).get('true').value() || 0,
                        failed:  _.chain(assignment.results).countBy(item => item.marks < assignment.passingMarks).get('true').value() || 0,
                    }
                }
            })

            // students list
            const courseDays = utils.getCousreDays(course)
            const students = course.students.map(student => {
                let data = {
                    name: student.name,
                    email: student.email,
                }

                // assignment marks
                const allAssignmentMarks = assignments.reduce((result, assignment) => {
                    const studentAssignment = _.find(assignment.results, item => item.studentId.equals(student._id))
                    const marks = studentAssignment?.marks || 0
                    result.sum += marks
                    result.total += assignment.totalMarks
                    return result
                }, {
                    sum: 0,
                    total: 0,
                })
                data.marks = {
                    sum: allAssignmentMarks.sum,
                    total:  allAssignmentMarks.total,
                }

                // attendance ratio
                const attendancesData = attendances.reduce((result, attendance) => {
                    if (attendance.student.equals(student._id)) {
                        result[attendance.status] += 1
                    }
                    return result
                }, {
                    present: 0,
                    absent: 0,
                    late: 0,
                })
                data.attendance = {
                    ...attendancesData,
                    ratio: attendancesData.present / courseDays.length
                }
                return data
            })
            
            utils.sendSuccess(res, {
                course,
                students,
                assignments: assignmentsData,

                _debug: {
                    assignments,
                    attendances
                }
            })
        } catch (err) {
            console.log(err)
            utils.sendError(res, 'Error fetching course details')
        }
    });
};

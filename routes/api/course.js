import mongoose from 'mongoose';
import _ from 'lodash'
import { adminPermission, teacherPermission } from '#root/routes/middleware/permission'
import Course from '#root/db/models/Course';
import User from '#root/db/models/User';
import Assignment from '#root/db/models/Assignment';
import Attendance from '#root/db/models/Attendance';

export default (app, utils) => {
    /*
    ** Fetch list of course
    ** Method   GET
    ** Access   superAdmin, admin, teacher, student
    ** Page     - /dashboard
    **          - /course
    **          - /attendance
    */
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

    /*
    ** Fetch options of course (teachers list / students list)
    ** Method   GET
    ** Access   superAdmin, admin, teacher
    ** Page     - /course/add
    **          - /course/edit/:courseId
    */
    app.get('/api/course/option', teacherPermission(), async (req, res) => {
        let query = {};
        try {
            switch (req.user.role) {
                case 'teacher':
                    query = req.user._id;
                    break;
                case 'admin':
                case 'superAdmin':
                    query = { role: { $in: ['teacher'] } };
                    break;
            }
            const teachers = await User.find(query);
            const students = await User.find({ role: 'student' });
            utils.sendSuccess(res, { teachers, students });
        } catch (err) {
            console.log(err);
            utils.sendError(res, 'Course data not found');
        }
    });

    /*
    ** Fetch simple info of course
    ** Method   GET
    ** Access   superAdmin, admin, teacher
    ** Page     - /course/edit/:courseId
    **          - /assignments/add/:courseId
    */
    app.get('/api/course/:id', teacherPermission(), async (req, res) => {
        try {
            const course = await Course.findById(req.params.id).populate('teacher students').lean();
            if (!course) {
                throw new Error('Course not found');
            }
            utils.sendSuccess(res, course)
        } catch (err) {
            console.log(err);
            utils.sendError(res, err.message);
        }
    });

    /*
    ** Create course
    ** Method   POST
    ** Access   superAdmin, admin
    ** Page     - /course/add
    */
    app.post('/api/course/add', adminPermission(), async (req, res) => {
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
            titleColor, //add titleColor
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
                titleColor, //add titleColor
            });
            await newCourse.save();
            utils.sendSuccess(res, Course);
        } catch (err) {
            console.error('Error adding course:', err);
            utils.sendError(res, 'Error adding course');
        }
    });

    /*
    ** Update course
    ** Method   PUT
    ** Access   superAdmin, admin, teacher
    ** Page     - /course/edit/:courseId
    */
    app.put('/api/course/:id', teacherPermission(), async (req, res) => {
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
            titleColor, //add titleColor
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
                    titleColor,  //add titleColor
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

    /*
    ** Delete course
    ** Method   DELETE
    ** Access   superAdmin, admin
    ** Page     - /course
    **          - /course/edit/:courseId
    */
    app.delete('/api/course/:id', adminPermission(), async (req, res) => {
        try {
            const deletedCourse = await Course.findByIdAndDelete(req.params.id);
            if (!deletedCourse) {
                return utils.sendError(res, 'Course not found');
            }
            utils.sendSuccess(res);
        } catch (err) {
            console.error('Error deleting course:', err);
            utils.sendError(res, 'Error deleting course');
        }
    });

    /*
    ** Fetch fully detail of course
    ** Method   GET
    ** Access   superAdmin, admin, teacher
    ** Page     - /course/detail/:courseId
    */
    app.get('/api/course/details/:id', teacherPermission(), async (req, res) => {
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
                const data = _.reduce(assignment.results, (result, studentAssignment) => {
                    result.marks += studentAssignment.marks || 0
                    if (!!studentAssignment.marks) result.markedCount++
                    if (!!studentAssignment.studentFileUrl) result.submittedCount++
                    if (studentAssignment.marks >= assignment.passingMarks) result.status.passed++
                    if (studentAssignment.marks < assignment.passingMarks) result.status.failed++
                    return result
                }, {
                    marks: 0,
                    markedCount: 0,
                    submittedCount: 0,
                    status: {
                        passed: 0,
                        failed: 0,
                    }
                })
                return {
                    ..._.pick(assignment, ['_id', 'name', 'marks', 'dueDate', 'fileUrl']),
                    ...data,
                    avgMarks: data.marks / data.submittedCount,
                }
            })

            // students list
            const courseDays = utils.getCourseDays(course)
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
            })
        } catch (err) {
            console.log(err)
            utils.sendError(res, 'Error fetching course details')
        }
    });
};

import multer from 'multer';
import fs from 'fs';
import moment from 'moment'; // Ensure moment.js is imported
import _ from 'lodash'
import Course from '#root/db/models/Course';
import Assignment from '#root/db/models/Assignment';
import Attendance from '#root/db/models/Attendance';
import { name } from 'ejs';

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const courseDir = `uploads/`;
        if (!fs.existsSync(courseDir)) {
            fs.mkdirSync(courseDir, { recursive: true });
        }
        cb(null, courseDir);
    },
    filename: (req, file, cb) => {
        const studentName = req.user.name.replace(/\s/g, '_');
        const timestamp = Date.now();
        cb(null, `submit_${timestamp}_${studentName}_${moment().format('YYYYMMDD')}_${file.originalname}`);
    }
});

const upload = multer({ storage });

export default (app, utils) => {    
    // Course Details (Student)
    app.get('/api/course/student/:courseId', async (req, res) => {
        try {
            const courseId = req.params.courseId
            const studentId = req.user._id // Assuming req.user contains the logged-in user's info

            const course = await Course.findById(courseId)
                .populate('teacher')
                .lean();
    
            // assignments
            const assignments = await Assignment.find({ courseId }).lean() // Corrected to find by courseId
            const studentAssignments = assignments.map(assignment => {
                const studentAssignment = _.find(assignment.results, item => item.studentId.equals(studentId))
                return {
                    ..._.pick(assignment, ['name', 'dueDate', 'fileUrl', '_id']),
                    marks: studentAssignment?.marks || -1,
                    studentFileUrl: studentAssignment?.studentFileUrl || '',
                    studentFileName: studentAssignment?.originalFileName || '',
                    studentId
                }
            })

            // attendance
            const attendances = await Attendance.find({ course: courseId, student: studentId }).lean();
            const attendanceCount = attendances.reduce((count, attendance) => {
                if (attendance.status === 'present') {
                    count.present++
                }
                count.total++
                return count
            }, {
                present: 0,
                total: 0
            })
            const attendanceRatio = attendanceCount.total ? ((attendanceCount.present / attendanceCount.total) * 100).toFixed(2) : 0
            
            utils.sendSuccess(res, {
                course,
                assignments: studentAssignments,
                attendance: {
                    ratio: attendanceRatio,
                    list: attendances,
                },
            })
        } catch (err) {
            console.error('Error fetching course details:', err);
            utils.sendError('Error fetching course details')
        }
    });

    // Submit Assignment (Student)
    app.post('/api/course/student/upload', upload.single('assignment'), async (req, res) => {
        try {
            const { assignmentId } = req.body;
            const studentId = req.user._id;
            const filePath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            const originalFileName = req.file.originalname;

            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) {
                return utils.sendError('Assignment not found')
            }

            const resultIndex = assignment.results.findIndex(result => result.studentId.toString() === studentId.toString());
            if (resultIndex > -1) {
                assignment.results[resultIndex].studentFileUrl = filePath;
                assignment.results[resultIndex].originalFileName = originalFileName; 
                assignment.results[resultIndex].uploadDate = new Date();
            } else {
                assignment.results.push({
                    studentId,
                    studentFileUrl: filePath,
                    originalFileName,
                    marks: 0,
                    uploadDate: new Date()
                });
            }

            await assignment.save();

            utils.sendSuccess(res)
        } catch (err) {
            console.error('Error uploading assignment:', err);
            utils.sendError('Error uploading assignment')
        }
    });
};

import Course from '#root/db/models/Course';
import Assignment from '#root/db/models/Assignment';
import Attendance from '#root/db/models/Attendance';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import moment from 'moment'; // Ensure moment.js is imported

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
            const courseId = req.params.courseId;
            const studentId = req.user._id; // Assuming req.user contains the logged-in user's info

            const course = await Course.findById(courseId)
                .populate('teacher')
                .populate({ path: 'students', match: { _id: studentId } })
                .lean();
    
            const assignments = await Assignment.find({ courseId }) // Corrected to find by courseId
                .populate({ path: 'results.studentId', match: { _id: studentId } })
                .lean();

            const attendanceRecords = await Attendance.find({ course: courseId, student: studentId })
                .populate('student')
                .lean();
            
            res.status(200).json({
                success: true,
                course,
                assignments: assignments.map(assignment => ({
                    ...assignment,
                    results: assignment.results.filter(result => result.studentId._id.toString() === studentId.toString())
                })),
                attendanceRecords
            });
        } catch (err) {
            console.error('Error fetching course details:', err);
            res.status(500).json({ success: false, message: 'Error fetching course details' });
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
                return res.status(404).json({ success: false, message: 'Assignment not found' });
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

            res.status(200).json({ success: true, message: 'Assignment submitted successfully' });
        } catch (err) {
            console.error('Error uploading assignment:', err);
            res.status(500).json({ success: false, message: 'Error uploading assignment', error: err.message });
        }
    });
};

import Course from '#root/db/models/Course';
import Assignment from '#root/db/models/Assignment';
import Attendance from '#root/db/models/Attendance';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const courseDir = `uploads/${req.body.courseName}`;
        if (!fs.existsSync(courseDir)) {
            fs.mkdirSync(courseDir, { recursive: true });
        }
        cb(null, courseDir);
    },
    filename: (req, file, cb) => {
        const studentName = req.user.name.replace(/\s/g, '_');
        cb(null, `${studentName}_${file.originalname}`);
    }
});

const upload = multer({ storage });

export default (app, utils) => {
    // course details (Student)
    app.get('/api/course/student/:courseId', async (req, res) => {
        try {
            const courseId = req.params.courseId;
            const studentId = req.user._id; // Assuming req.user contains the logged-in user's info

            const course = await Course.findById(courseId)
                .populate('teacher')
                .populate({ path: 'students', match: { _id: studentId } })
                .lean();
    
            const assignments = await Assignment.findbyId(courseId)
                .populate({ path: 'results.studentId', match: { _id: studentId } })
                .lean();

            const attendanceRecords = await Attendance.find({ course: courseId, student: studentId })
                .populate({ path: 'student', match: { _id: studentId } })
                .lean();
            
            res.status(200).json({
                success: true,
                course,
                assignments: assignments.map(assignment => ({
                    ...assignment,
                    results: assignment.results.filter(result => result.studentId._id.toString() === studentId.toString())
                })),
                attendanceRecords: attendanceRecords.map(record => ({
                    ...record,
                    results: record.results.filter(result => result.studentId._id.toString() === studentId.toString())
                }))
            });
        } catch (err) {
            console.error('Error fetching course details:', err);
            res.status(500).json({ success: false, message: 'Error fetching course details' });
        }
    });

    // Endpoint for uploading assignments
    app.post('/api/course/student/upload', upload.single('assignment'), async (req, res) => {
        try {
            const { assignmentId } = req.body;
            const studentId = req.user._id;
            const filePath = path.join(req.file.destination, req.file.filename);

            // Find the assignment and update the results
            const assignment = await Assignment.findById(assignmentId);
            const studentResult = assignment.results.find(result => result.studentId.toString() === studentId.toString());

            if (studentResult) {
                studentResult.filePath = filePath;
                studentResult.fileName = req.file.filename;
            } else {
                assignment.results.push({
                    studentId,
                    filePath,
                    fileName: req.file.filename,
                    marks: 0 // Assuming marks are set to 0 initially and will be graded later
                });
            }

            await assignment.save();
            res.status(200).json({ success: true, message: 'Assignment uploaded successfully', fileName: req.file.filename });
        } catch (err) {
            console.error('Error uploading assignment:', err);
            res.status(500).json({ success: false, message: 'Error uploading assignment' });
        }
    });
};

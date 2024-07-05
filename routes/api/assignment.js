import multer from 'multer';
import fs from 'fs';
import moment from 'moment';
import Assignment from '#root/db/models/Assignment';
import Course from '#root/db/models/Course';

// file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`); 
    }
});

const upload = multer({ storage: storage });

const dir = 'uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

export default (app, utils) => {
    // list_assignment
    app.get('/api/assignments', async (req, res) => {
        let query = {};
        try {
            if (req.user.role === 'teacher') {
                const courses = await Course.find({ teacher: req.user._id }).select('_id');
                const courseIds = courses.map(course => course._id);
                query = { courseId: { $in: courseIds } };
            } else if (req.user.role === 'student') {
                const courses = await Course.find({ students: req.user._id }).select('_id');
                const courseIds = courses.map(course => course._id);
                query = { courseId: { $in: courseIds } };
            }

            const assignments = await Assignment.find(query).populate({
                path: 'courseId',
                populate: {
                    path: 'teacher',
                    model: 'User'
                }
            });
            utils.sendSuccess(res, assignments);
        } catch (err) {
            utils.sendError(res, 'Assignments not found');
        }
    });

    // Add assignment
    app.get('/api/assignments/add/:id', async (req, res) => {
        try {
            const course = await Course.findById(req.params.id).populate('students');
            res.json({ success: true, course });
        } catch (err) {
            utils.sendError(res, 'Error fetching course details');
        }
    });

    // Upload assignment
    app.post('/api/assignments/upload', upload.array('assignments'), async (req, res) => {
        try {
            const { course, name, dueDate, totalMarks, passingMarks } = req.body;
            const files = req.files;

            if (!files || files.length === 0) {
                return res.status(400).json({ success: false, message: 'No files uploaded' });
            }
            const assignments = files.map((file, index) => {
                const filePath = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
                return {
                    courseId: course,
                    name: Array.isArray(name) ? name[index] : name,
                    dueDate: new Date(Array.isArray(dueDate) ? dueDate[index] : dueDate),
                    totalMarks: parseInt(Array.isArray(totalMarks) ? totalMarks[index] : totalMarks, 10),
                    passingMarks: parseInt(Array.isArray(passingMarks) ? passingMarks[index] : passingMarks, 10),
                    fileUrl: filePath,
                    uploadDate: new Date()
                };
            });
            await Assignment.insertMany(assignments);
            res.status(200).json({ success: true, message: 'Assignments uploaded successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error uploading assignments', error: err.message });
        }
    });

    // edit assignment
    app.get('/api/assignments/:id/edit', async (req, res) => {
        try {
            const assignment = await Assignment.findById(req.params.id).populate('courseId').lean();
            if (!assignment) {
                return res.status(404).json({ success: false, message: 'Assignment not found' });
            }
            res.status(200).json({ success: true, data: assignment });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching assignment details', error: err.message });
        }
    });

    // update assignment (PUT)
    app.put('/api/assignments/:id', upload.single('assignments'), async (req, res) => {
        try {
            const { name, dueDate, totalMarks, passingMarks } = req.body;
            let fileUrl;

            if (req.file) {
                fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            const updateData = {
                name,
                dueDate: new Date(dueDate),
                totalMarks: parseInt(totalMarks, 10),
                passingMarks: parseInt(passingMarks, 10)
            };

            if (fileUrl) {
                updateData.fileUrl = fileUrl;
            }

            const assignment = await Assignment.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            );

            if (!assignment) {
                return res.status(404).json({ success: false, message: 'Assignment not found' });
            }

            res.status(200).json({ success: true, message: 'Assignment updated successfully', data: assignment });
        } catch (err) {
            // console.log(err)
            res.status(500).json({ success: false, message: 'Error updating assignment', error: err.message });
        }
    });

    //mark_assignment
    app.get('/api/assignments/:id/mark', async (req, res) => {
        try {
            const assignment = await Assignment.findById(req.params.id).populate({
                path: 'courseId',
                populate: {
                    path: 'students',
                    model: 'User'
                }
            }).lean();

            if (!assignment) {
                return res.status(404).json({ success: false, message: 'Assignment not found' });
            }

            res.status(200).json({ success: true, data: assignment });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching assignment details', error: err.message });
        }
    });

    // mark_assignment (POST)
    app.post('/api/assignments/:id/mark', async (req, res) => {
        try {
            const { marks } = req.body;
            const assignmentId = req.params.id;

            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) {
                return res.status(404).json({ success: false, message: 'Assignment not found' });
            }

            marks.forEach(mark => {
                const existingMark = assignment.results.find(result => result.studentId.toString() === mark.studentId);
                if (existingMark) {
                    existingMark.marks = mark.marks;
                } else {
                    assignment.results.push({
                        studentId: mark.studentId,
                        marks: mark.marks
                    });
                }
            });

            await assignment.save();
            res.status(200).json({ success: true, message: 'Marks updated successfully', data: assignment });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error updating marks', error: err.message });
        }
    });

    // delete assignment (DELETE)
    app.delete('/api/assignments/:id', async (req, res) => {
        try {
            const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);
            if (!deletedAssignment) {
                return res
                    .status(404)
                    .json({ success: false, message: 'Assignment not found' });
            }
            res.status(200).json({
                success: true,
                message: 'Assignment deleted successfully',
            });
        } catch (err) {
            console.error('Error deleting Assignment:', err);
            res.status(500).json({
                success: false,
                message: 'Error deleting Assignment',
                error: err.message,
            });
        }
    });
}

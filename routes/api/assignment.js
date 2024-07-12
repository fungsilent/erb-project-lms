import multer from 'multer';
import fs from 'fs';
import moment from 'moment';
import Assignment from '#root/db/models/Assignment';
import Course from '#root/db/models/Course';
import mongoose from 'mongoose';

// file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = `uploads/`;
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        cb(null, `${timestamp}_${moment().format('YYYYMMDD')}_${file.originalname}`); 
    }
});

const upload = multer({ storage: storage });

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

    // Upload assignment
    app.post('/api/assignments/upload', upload.array('assignments'), async (req, res) => {
        try {
            const { course, name, dueDate, totalMarks, passingMarks } = req.body;
            const files = req.files;

            if (!files || files.length === 0) {
                return utils.sendError(res, 'No files uploaded')
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
            utils.sendSuccess(res)
        } catch (err) {
            utils.sendError(res, 'Error uploading assignments')
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
                return utils.sendError(res, 'Assignment not found')
            }
            utils.sendSuccess(res, { message: assignment })
        } catch (err) {
            utils.sendError(res, 'Error updating assignment')
        }
    });

    //mark_assignment
    app.get('/api/assignments/:id', async (req, res) => {
        try {
            const assignment = await Assignment.findById(req.params.id).populate({
                path: 'courseId',
                populate: {
                    path: 'students',
                    model: 'User'
                },
            }).lean();
            
            if (!assignment) {
                return utils.sendError(res, 'Assignment not found')
            }

            const data = {
                ...assignment,
                course: assignment.courseId
            }
            delete data.courseId
            utils.sendSuccess(res, data)
        } catch (err) {
            utils.sendError(res, 'Error fetching assignment details')
        }
    });

    // mark_assignment (POST)
    app.post('/api/assignments/:id/mark', async (req, res) => {
        try {
            const { marks } = req.body;
            const assignmentId = req.params.id;

            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) {
                utils.sendError(res, 'Assignment not found')
            }
            
            marks.forEach(mark => {
                const existingMark = assignment.results.find(result => result.studentId.equals(mark.studentId))
                if (existingMark) {
                    // set marks while submitted assignment
                    existingMark.marks = !!existingMark.studentFileUrl ? mark.marks : null
                } else {
                    assignment.results.push({
                        studentId: mark.studentId,
                    });
                }
            });

            await assignment.save();
        
            utils.sendSuccess(res)
        } catch (err) {
            utils.sendError(res, 'Error updating marks')
        }
    });

    // delete assignment (DELETE)
    app.delete('/api/assignments/:id', async (req, res) => {
        try {
            const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);
            if (!deletedAssignment) {
                return utils.sendError(res, 'Assignment not found')
            }
            utils.sendSuccess(res)
        } catch (err) {
            console.error('Error deleting Assignment:', err);
            utils.sendError(res, 'Error deleting Assignment')
        }
    });

    // number of assignment (dashboard)
    app.get('/api/assignment/count/:id', async (req, res) => {
        try {
            const courseId = new mongoose.Types.ObjectId(req.params.id);
            const count = await Assignment.countDocuments({ courseId })
            console.log(`assignment count: ${count}`);
            utils.sendSuccess(res, { count })
        } catch (error) {
            console.error('Error fetching assignment count:', error);
            utils.sendError(res, 'Error fetching assignment count')
        }
    });
}

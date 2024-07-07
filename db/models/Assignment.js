import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, required: true },
    passingMarks: { type: Number, required: true },
    fileUrl: { type: String },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    results: [
        {
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            marks: { type: Number },
            studentFileUrl: { type: String },
            originalFileName: { type: String },
            uploadDate: { type: Date, default: Date.now }
        }
    ],
    uploadDate: { type: Date, default: Date.now }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;

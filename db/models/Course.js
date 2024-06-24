import mongoose from 'mongoose'

const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    materials: [{ type: String }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxStudents: { type: Number, required: true },
    excludeDates: [{ type: Date }],
})

export default mongoose.model('Course', CourseSchema)

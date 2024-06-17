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
})

export default mongoose.model('Course', CourseSchema)

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
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxStudents: { type: Number, required: true },
    excludeDates: [{ type: Date }],
    color: { type: String, required: true } ,// Add course color
    titleColor: { type: String, required: true } // Add Title color
})

export default mongoose.model('Course', CourseSchema)

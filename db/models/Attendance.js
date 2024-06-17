import mongoose from 'mongoose'

const AttendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent'], required: true },
})

export default mongoose.model('Attendance', AttendanceSchema)

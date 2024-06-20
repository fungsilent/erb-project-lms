import mongoose from 'mongoose'

const AnnouncementSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    content: { type: String, required: true },
    courseId: { type: mongoose.ObjectId },
    to: {
        all: { type: Boolean, required: true, default: false },
        teacher: { type: Boolean, required: true, default: false },
        student: { type: Boolean, required: true, default: false },
    },
})

AnnouncementSchema.pre('save', async function (next) {
    if (this.to.all) {
        this.to.teacher = true
        this.to.student = true
    }
    next()
})

export default mongoose.model('Announcement', AnnouncementSchema)

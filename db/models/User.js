import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['superAdmin', 'admin', 'teacher', 'student'],
        required: true,
    },
})

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(
            this.password,
            process.env.passwordSalt
        )
    }
    next()
})

export default mongoose.model('User', UserSchema)

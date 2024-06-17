import User from '#root/db/models/User'
import Course from '#root/db/models/Course'

/*
 * User view
 */
export const publicView = app => {
    // lander
    app.get('/', (req, res) => {
        if (req.auth) {
            return res.redirect('/dashboard')
        }
        res.render('login')
    })
}

export const privateView = app => {
    // logout
    app.get('/logout', (req, res) => {
        res.clearCookie('token')
        res.redirect('/')
    })

    // dashboard
    app.get('/dashboard', async (req, res) => {
        if (req.user.role === 'teacher') {
            const courses = await Course.find({ teacher: req.user._id })
            const students = await User.find({ role: 'student' })
            res.render('dashboard/teacher', {
                user: req.user,
                courses,
                students,
            })
        } else {
            const enrolledCourses = await Course.find({
                students: req.user._id,
            })
            res.render('dashboard/student', { user: req.user, enrolledCourses })
        }
    })
}

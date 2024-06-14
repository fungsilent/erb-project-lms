import auth from '#root/routes/middleware/auth'
import User from '#root/db/models/User'
import Course from '#root/db/models/Course'

/*
 * User view
*/
export default app => {
    // lander
    app.get('/', (req, res) => {
        res.render('login')
    })

    // logout
    app.get('/logout', (req, res) => {
        res.clearCookie('token')
        res.redirect('/')
    })

    // dashboard
    app.get('/dashboard', auth, async (req, res) => {
        if (req.user.role === 'teacher') {
            const courses = await Course.find({ teacher: req.user._id })
            const students = await User.find({ role: 'student' })
            res.render('dashboard/teacher', { user: req.user, courses, students })
        } else {
            const enrolledCourses = await Course.find({ students: req.user._id })
            res.render('dashboard/student', { user: req.user, enrolledCourses })
        }
    })
}
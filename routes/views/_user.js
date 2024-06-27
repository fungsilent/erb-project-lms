import User from '#root/db/models/User'
import Course from '#root/db/models/Course'

/*
 * User view
 */
export default (app, utils) => {
    // lander
    // app.get('/', (req, res) => {
    //     // if (req.auth) {
    //     //     return res.redirect('/dashboard')
    //     // }
    //     res.render('login', { layout: 'layouts/blank' })
    // })

    // dashboard
    // app.get('/dashboard', async (req, res) => {
    //     switch (req.user.role) {
    //         case 'superAdmin':
    //         case 'admin': {
    //             return res.render('dashboard/admin')
    //         }
    //         case 'teacher': {
    //             const courses = await Course.find({ teacher: req.user._id })
    //             const students = await User.find({ role: 'student' })
    //             return res.render('dashboard/teacher', {
    //                 courses,
    //                 students,
    //             })
    //         }
    //         case 'student': {
    //             const enrolledCourses = await Course.find({
    //                 students: req.user._id,
    //             })
    //             return res.render('dashboard/student', {
    //                 enrolledCourses,
    //             })
    //         }
    //     }
    // })

    // app.get('/user', async (req, res) => {
    //     res.render('user/table')
    // })

    // app.get('/user/add', async (req, res) => {
    //     res.render('user/add')
    // })
}

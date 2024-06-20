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
        res.render('login', { layout: 'layouts/blank' })
    })
}

export const privateView = app => {
    const formatUser = user => {
        const format = user.toObject()
        if (user.role === 'superAdmin') {
            format.role = 'admin'
        }
        return format
    }

    // logout
    app.get('/logout', (req, res) => {
        res.clearCookie('token')
        res.redirect('/')
    })

    // dashboard
    app.get('/dashboard', async (req, res) => {
        const user = formatUser(req.user)
        switch (req.user.role) {
            case 'superAdmin':
            case 'admin': {
                return res.render('dashboard/admin', {
                    user,
                })
            }
            case 'teacher': {
                const courses = await Course.find({ teacher: req.user._id })
                const students = await User.find({ role: 'student' })
                return res.render('dashboard/teacher', {
                    user,
                    courses,
                    students,
                })
            }
            case 'student': {
                const enrolledCourses = await Course.find({
                    students: req.user._id,
                })
                return res.render('dashboard/student', {
                    user,
                    enrolledCourses,
                })
            }
        }
    })

    app.get('/user', async (req, res) => {
        res.render('user/table', {
            user: formatUser(req.user),
        })
    })

    app.get('/user/add', async (req, res) => {
        res.render('user/add', {
            user: formatUser(req.user),
        })
    })
}

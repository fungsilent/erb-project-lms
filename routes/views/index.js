import auth from '../../middleware/auth.js'
import User from '../../models/User.js'
import Course from '../../models/Course.js'

export default app => {
    
    //front page
    app.get('/', (req, res) => {
        res.render('login')
    })

    //login
    // app.get('/login', (req, res) => {
    //     res.render('login');
    // });

    //Dashboard
    app.get('/dashboard', auth, async (req, res) => {
        if (req.user.role === 'teacher') {
            const courses = await Course.find({ teacher: req.user._id });
            const students = await User.find({ role: 'student' });
            res.render('teacherDashboard', { user: req.user, courses, students });
        } else {
            const enrolledCourses = await Course.find({ students: req.user._id });
            res.render('studentDashboard', { user: req.user, enrolledCourses });
        }
    });

    //logout
    // Logout route
    app.get('/logout', (req, res) => {
        res.clearCookie('token');
        res.redirect('/');
    });

    //auth page
    app.get('/auth', (req, res) => {
        res.render('auth')
    })
}
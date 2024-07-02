import Course from '#root/db/models/Course'
import User from '#root/db/models/User'

export default (app, utils) => {
    // List courses and display add course form (GET)
    app.get('/course', async (req, res) => {
        let query = {}
        switch (req.user.role) {
            // case 'superAdmin':
            // case 'admin': {
            //     break
            // }
            case 'teacher': {
                query = { teacher: req.user._id }
                break
            }
            case 'student': {
                query = { students: req.user._id }
                break
            }
        }
        const courses = await Course.find(query).populate('teacher')
        res.render('course/list', { courses })
    })

    // Display add course form (GET)
    app.get('/course/add', async (req, res) => {
        const teachers = await User.find({
            role: { $in: ['teacher', 'admin', 'superAdmin'] },
        })
        const students = await User.find({ role: 'student' })
        res.render('course/add', { teachers, students })
    })

    // Render edit course page
    app.get('/course/edit/:id', async (req, res) => {
        try {
            const course = await Course.findById(req.params.id).populate(
                'teacher students'
            )
            if (!course) {
                throw new Error('Course not found')
            }
            const teachers = await User.find({
                role: { $in: ['teacher', 'admin', 'superAdmin'] },
            })
            const students = await User.find({ role: 'student' })
            res.render('course/edit', { course, teachers, students })
        } catch (err) {
            next(err)
        }
    })
}

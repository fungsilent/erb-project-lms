import Course from '#root/db/models/Course'

export default (app, utils) => {
    /*
    ** Fetch all course schedule
    ** Method   GET
    ** Access   superAdmin, admin, teacher, student
    ** Page     - /calendar
    */
    app.get('/api/calendar/events', async (req, res) => {
        let query = {};
        try {
            switch (req.user.role) {
                case 'teacher':
                    query = { teacher: req.user._id };
                    break;
                case 'student':
                    query = { students: req.user._id };
                    break;
            }
            const courses = await Course.find(query).lean();

            const formattedCourses = courses.map(course => ({
                name: course.name,
                startDate: course.startDate,
                endDate: course.endDate,
                excludeDates: course.excludeDates || [],
                color: course.color,
                titleColor: course.titleColor //textColor
            }))

            utils.sendSuccess(res, formattedCourses)
        } catch (err) {
            console.error('Error fetching courses:', err)
            utils.sendError(res, 'Error fetching courses')
        }
    })
}

import Course from '#root/db/models/Course'

export default (app, utils) => {
    app.get('/api/calendar/events', async (req, res) => {
        try {
            const courses = await Course.find({
                $or: [{ teacher: req.user._id }, { students: req.user._id }],
            }).lean()

            const formattedCourses = courses.map(course => ({
                name: course.name,
                startDate: course.startDate,
                endDate: course.endDate,
                excludeDates: course.excludeDates || [],
            }))

            utils.sendSuccess(res, formattedCourses)
        } catch (err) {
            console.error('Error fetching courses:', err)
            utils.sendError(res, 'Error fetching courses')
        }
    })
}

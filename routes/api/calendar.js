import Course from '#root/db/models/Course';

export default (app, utils) => {
    app.get('/api/calendar/events', async (req, res) => {
        try {
            const courses = await Course.find({
                $or: [
                    { teacher: req.user._id },
                    { students: req.user._id }
                ]
            }).lean();

            const formattedCourses = courses.map(course => ({
                name: course.name,
                startDate: course.startDate,
                endDate: course.endDate,
                excludeDates: course.excludeDates || []
            }));

            res.json(formattedCourses);
        } catch (err) {
            console.error('Error fetching courses:', err);
            res.status(500).json({ message: 'Error fetching courses' });
        }
    });
};

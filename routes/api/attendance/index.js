import Attendance from '#root/db/models/Attendance'

export default (app, utils) => {
    // Mark attendance route (POST)
    app.post('/api/attendance/mark', async (req, res) => {
        const { student, course, date, status } = req.body
        try {
            const attendance = new Attendance({ student, course, date, status })
            await attendance.save()
            res.status(201).send('Attendance marked')
        } catch (err) {
            res.status(400).send(err.message)
        }
    })

    // Get attendance by course (GET)
    app.get('/api/attendance/:courseId', async (req, res) => {
        try {
            const attendance = await Attendance.find({ course: req.params.courseId })
            res.status(200).json(attendance)
        } catch (err) {
            res.status(500).send(err.message)
        }
    })
}

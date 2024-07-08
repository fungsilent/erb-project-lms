import Attendance from '#root/db/models/Attendance';
import Course from '#root/db/models/Course';
import moment from 'moment';

export default (app, utils) => {
    // get cousre attendance info (GET)
    app.get('/api/attendance/:courseId', async (req, res) => {
        try {
            const course = await Course.findById(req.params.courseId).populate('students')
            utils.sendSuccess(res, course)
        } catch (err) {
            utils.sendError(res, 'Fetch course details failed')
        }
    })

    // get all attendance record (GET)
    app.get('/api/attendance/:courseId/mark', async (req, res) => {
        try {
            const { date } = req.query
            const records = await Attendance.find({
                course: req.params.courseId,
                date: moment(date).startOf().toISOString(),
            })
            utils.sendSuccess(res, records)
        } catch (err) {
            console.log(err)
            utils.sendError(res, 'Fetch attendance records failed')
        }
    })

    // create/update attendance record (POST)
    app.post('/api/attendance/:courseId/mark', async (req, res) => {
        try {
            const { courseId } = req.params
            const { date, records } = req.body
            for (const record of records) {
                const existingRecord = await Attendance.findOne({
                    course: courseId,
                    date: moment(date).startOf().toISOString(),
                    student: record.id,
                })
                if (existingRecord) {
                    existingRecord.status = record.status
                    await existingRecord.save()
                } else {
                    const newRecord = new Attendance({
                        course: courseId,
                        date: moment(date).startOf().toISOString(),
                        student: record.id,
                        status: record.status
                    })
                    await newRecord.save()
                }
            }
            utils.sendSuccess(res)
        } catch (err) {
            utils.sendError(res, 'Mark attendance failed')
        }
    })
}

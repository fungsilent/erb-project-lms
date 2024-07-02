import Attendance from '#root/db/models/Attendance';
import Course from '#root/db/models/Course';

export default (app, utils) => {
    // attendance list (GET) - within a date range
    app.get('/api/attendance/courses', async (req, res) => {
        try {
            const today = new Date();
            let query = {
                startDate: { $lte: today },
                endDate: { $gte: today },
            };
    
            if (req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
                query.teacher = req.user._id;
            }
    
            const courses = await Course.find(query).populate('teacher');
            res.status(200).json({ success: true, data: courses });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching courses', error: err.message });
        }
    });

    app.get('/api/attendance/courses/:id', async (req, res) => {
        try {
            const course = await Course.findById(req.params.id).populate('students');
            const students = course.students;
            const today = new Date().toISOString().split('T')[0]; 
            res.json({ success: true, course, students, today });
        } catch (err) {
            utils.sendError(res, 'Error fetching course details');
        }
    });

    // update attendance record (POST)
    app.post('/api/attendance/mark', async (req, res) => {
        try {
            const { courseId, date, records } = req.body;
            for (const record of records) {
                const existingRecord = await Attendance.findOne({ course: courseId, date: new Date(date), student: record.studentId });
                if (existingRecord) {
                    existingRecord.status = record.status;
                    await existingRecord.save();
                } else {
                    const newRecord = new Attendance({
                        course: courseId,
                        date: new Date(date),
                        student: record.studentId,
                        status: record.status
                    });
                    await newRecord.save();
                }
            }
            res.status(200).json({ success: true, message: 'Attendance marked successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error marking attendance', error: err.message });
        }
    });

    // records.ejs (load attendance records)
    app.get('/api/attendance/records/:id', async (req, res) => {
        try {
            const courseId = req.params.id;
            const records = await Attendance.find({ course: courseId }).populate('student course');
            res.status(200).json({ success: true, records });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching attendance records', error: err.message });
        }
    });

    // recrods.ejs (update attendance records)
    app.put('/api/attendance/records/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { attendance } = req.body;
            for (let record of attendance) {
                await Attendance.findOneAndUpdate(
                    { course: id, student: record.studentId, date: new Date(record.date).toISOString().split('T')[0] },
                    { status: record.status },
                    { new: true, upsert: true }
                );
            }

            res.status(200).json({ success: true, message: 'Attendance records updated successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error updating attendance records', error: err.message });
        }
    });
}

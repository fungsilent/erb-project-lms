import { requiredApiAuth } from '#root/routes/middleware/auth'
import userPublicRouter from '#root/routes/api/user/public'
import userRouter from '#root/routes/api/user'
import courseRouter from '#root/routes/api/course'
import attendanceRouter from '#root/routes/api/attendance'
import announcementRouter from '#root/routes/api/announcement'
import calendarRouter from '#root/routes/api/calendar'
import assignmentRouter from '#root/routes/api/assignment'
import studentRouter from '#root/routes/api/student'

export default (...all) => {
    const [app] = all

    // Public APIs
    userPublicRouter(...all)


    // Protected APIs
    app.use('/api/*', requiredApiAuth)
    
    userRouter(...all)
    courseRouter(...all)
    attendanceRouter(...all)
    announcementRouter(...all)
    calendarRouter(...all)
    assignmentRouter(...all)
    studentRouter(...all)
};

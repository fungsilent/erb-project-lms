import { requiredApiAuth } from '#root/routes/middleware/auth'
import userPublicRouter from '#root/routes/api/user/public'
import userRouter from '#root/routes/api/user'
import courseRouter from '#root/routes/api/course'
import attendanceRouter from '#root/routes/api/attendance'
import announcementRouter from '#root/routes/api/announcement'

export default (...all) => {
    // register api
    const [app] = all

    userPublicRouter(...all)

    app.use('/api/*', requiredApiAuth)

    userRouter(...all)
    courseRouter(...all)
    attendanceRouter(...all)
    announcementRouter(...all)
}

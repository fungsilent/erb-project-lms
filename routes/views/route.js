import { requiredViewAuth } from '#root/routes/middleware/auth'
import {
    publicView as userPublicView,
    privateView as userPrivateView,
} from '#root/routes/views/user'
import courseView from '#root/routes/views/course'
import calendarView from '#root/routes/views/calendar'

export default app => {
    // Non-authenticated views
    userPublicView(app)

    // Apply view auth middleware to all subsequent views
    app.use(requiredViewAuth)

    // Authenticated views
    userPrivateView(app)
    courseView(app)
    calendarView(app)
}

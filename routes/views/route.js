import { requiredViewAuth } from '#root/routes/middleware/auth'
import {
    publicView as userPublicView,
    privateView as userPrivateView,
} from '#root/routes/views/user'
import courseView from '#root/routes/views/course'

export default (...all) => {
    // register view
    const [app] = all

    // non auth view
    userPublicView(...all)

    app.use(requiredViewAuth)

    // auth view
    userPrivateView(...all)
    courseView(...all)
}

import { auth, requiredAuth } from '#root/routes/middleware/auth'
import {
    publicView as userPublicView,
    privateView as userPrivateView,
} from '#root/routes/views/user'
import courseView from '#root/routes/views/course'

export default (...all) => {
    // register view
    const [app] = all
    app.use(auth)

    // non auth view
    userPublicView(...all)

    app.use(requiredAuth)

    // auth view
    userPrivateView(...all)
    courseView(...all)
}

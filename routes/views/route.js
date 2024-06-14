import userView from '#root/routes/views/user'
import courseView from '#root/routes/views/course'

export default (...all) => {
    // register view
    userView(...all)
    courseView(...all)
}
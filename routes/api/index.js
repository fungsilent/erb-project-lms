// import userRouter from '#root/routes/api/user'

// export default (...all) => {
//     // register api
//     userRouter(...all)
// }

import userRouter from '#root/routes/api/user'
import courseRouter from '#root/routes/api/course'
import attendanceRouter from '#root/routes/api/attendance'

export default (...all) => {
    // register api
    userRouter(...all)
    courseRouter(...all)
    attendanceRouter(...all)
}

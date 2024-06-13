import userRouter from '#root/routes/api/user'
export default (...all) => {
    // register api
    userRouter(...all)
}
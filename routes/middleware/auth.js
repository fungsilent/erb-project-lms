import jwt from 'jsonwebtoken'
import User from '#root/db/models/User'

const auth = async (req, res, next) => {
    const token = req.cookies.token
    if (token) {
        try {
            // try to find user by token
            const data = jwt.verify(token, process.env.jwtKey)
            const user = await User.findById(data.id)
            if (!user) {
                throw new Error()
            }
            req.user = user
        } catch (err) {
            // no need hanlde
        }
    }
    next()


    // const token = req.cookies.token
    // if (!token) {
    //     return res.status(401).redirect('/auth')
    // }
    // try {
    //     const decoded = jwt.verify(token, process.env.jwtKey)
    //     const user = await User.findById(decoded.id)
    //     if (!user) {
    //         throw new Error()
    //     }
    //     req.user = user
    //     next()
    // } catch (err) {
    //     res.status(401).redirect('/auth')
    // }
}

export default auth
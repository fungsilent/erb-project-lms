import jwt from 'jsonwebtoken'
import User from '#root/db/models/User'

export const auth = async (req, res, next) => {
    const token = req.cookies.token
    req.auth = false
    req.user = null
    if (token) {
        try {
            // try to find user by token
            const data = jwt.verify(token, process.env.jwtKey)
            const user = await User.findById(data.id)
            if (!user) {
                throw new Error()
            }
            req.auth = true
            req.user = user
        } catch (err) {
            // no need hanlde
        }
    }
    next()
}

export const requiredAuth = async (req, res, next) => {
    if (!req.auth) {
        return res.status(401).redirect('/')
    }
    next()
}

export default {
    auth,
    requiredAuth,
}
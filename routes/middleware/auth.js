import jwt from 'jsonwebtoken'
import moment from 'moment'
import User from '#root/db/models/User'

export const auth = async (req, res, next) => {
    const token = req.cookies.token
    req.auth = false
    req.user = null
    if (token) {
        try {
            // try to find user by token
            const data = jwt.verify(token, process.env.jwtKey)
            if (moment().isAfter(data.expired)) {
                throw new Error('abort')
            }
            const user = await User.findById(data.id)
            if (!user) {
                throw new Error('abort')
            }
            req.auth = true
            req.user = user
        } catch (err) {
            // no need handle
        }
    }
    next()
}

export const requiredAuth = async (req, res, next) => {
    if (!req.auth) {
        return res.redirect('/')
    }
    next()
}

export default {
    auth,
    requiredAuth,
}

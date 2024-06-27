import jwt from 'jsonwebtoken'
import moment from 'moment'
import utils from '#root/routes/utils'
import User from '#root/db/models/User'

const getToken = req => {
    try {
        return req.headers.authorization.split(' ')[1]
    } catch (err) {
        return ''
    }
}

export const auth = async (req, res, next) => {
    const token = getToken(req)
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

// export const requiredViewAuth = async (req, res, next) => {
//     if (!req.auth) {
//         return res.redirect('/')
//     }
//     next()
// }

export const requiredApiAuth = async (req, res, next) => {
    if (!req.auth) {
        return utils.sendError(res, 'authentication denied')
    }
    next()
}

export default {
    auth,
    // requiredViewAuth,
    requiredApiAuth,
}

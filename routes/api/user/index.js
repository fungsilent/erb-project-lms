import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import moment from 'moment'
import User from '#root/db/models/User'

export default (app, utils) => {
    // Login route (POST)
    app.post('/api/user/login', async (req, res) => {
        const { email, password } = req.body
        try {
            const user = await User.findOne({ email })
            if (!user) {
                return utils.sendError(res, 'Login failed')
            }
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return utils.sendError(res, 'Login failed')
            }
            const token = jwt.sign(
                {
                    id: user._id,
                    role: user.role,
                    expired: utils.getTimestamp(moment().add(30, 'days')),
                },
                process.env.jwtKey
            )
            res.cookie('token', token, { maxAge: 2592000, httpOnly: true }) // 1 month
            utils.sendSuccess(res, { token })
        } catch (err) {
            console.log(err)
            utils.sendError(res, err.message)
        }
    })

    // Register route (POST)
    app.post('/api/user/add', async (req, res) => {
        const { name, email, password, role } = req.body
        try {
            const user = await User.findOne({ email })
            if (user) {
                return utils.sendError(res, 'Email duplicated.')
            }
            const newUser = new User({ name, email, password, role })
            await newUser.save()
            utils.sendSuccess(res)
        } catch (err) {
            utils.sendError(res, 'Create user failed.')
        }
    })

    app.get('/api/user', async (req, res) => {
        try {
            const users = await User.find({})
            utils.sendSuccess(res, users)
        } catch (err) {
            console.log(err)
            utils.sendError(res, err.message)
        }
    })
}

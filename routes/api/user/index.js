import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import moment  from 'moment'
import User from '#root/db/models/User'

export default (app, utils) => {
    // Login route (POST)
    app.post('/login', async (req, res) => {
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
            const token = jwt.sign({
                id: user._id,
                role: user.role,
                expired: moment().add(30, 'days').unix(),
            }, process.env.jwtKey)
            res.cookie('token', token, { maxAge: 900000, httpOnly: true })
            
            // Redirect based on role
            if (user.role === 'teacher' || user.role === 'student' ) {
                res.redirect('/dashboard')
            } else {
                res.redirect('/')
            }
        } catch (err) {
            console.log(err)
            utils.sendError(res, err.message)
        }
    })

    // Register route (POST)
    app.post('/register', async (req, res) => {
        const { name, email, password, role } = req.body
        try {
            const user = new User({ name, email, password, role })
            await user.save()
            res.status(201).send('User registered')
            //res.redirect('/')
        } catch (err) {
            res.status(400).send(err.message)
        }
    })

    app.get('/register', async (req, res) => {
        const { name, email, password, role } = req.body
        try {
            const user = new User({ name, email, password, role })
            await user.save()
            res.status(201).send('User registered')
            res.redirect('/')
        } catch (err) {
            res.status(400).send(err.message)
        }
    })
}
        
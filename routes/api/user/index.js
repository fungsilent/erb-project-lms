import jwt from 'jsonwebtoken'

export default (app, utils) => {
    // user api
    app.post('/api/user/login', (req, res) => {
        const { email, password } = req.body
        if (email !== 'admin' && password !== 'admin') {
            return utils.sendError(res, 'Login failed')
        }

        // const token = jwt.sign(date{ id: 'admin001' }, global.__jwtKey)
        const token = jwt.sign({ id: 'admin001', timestap }, global.__jwtKey)
        console.log(token)
        res.cookie('token', token, { maxAge: 900000 })
        utils.sendSuccess(res)
    })
}
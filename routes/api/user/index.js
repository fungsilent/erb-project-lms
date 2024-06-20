import User from '#root/db/models/User'

export default (app, utils) => {
    // Register (POST)
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

    // User list (GET)
    app.get('/api/user', async (req, res) => {
        try {
            const users = await User.find({})
            utils.sendSuccess(res, users)
        } catch (err) {
            console.log(err)
            utils.sendError(res, err.message)
        }
    })

    // Delete user (DELETE)
    app.delete('/api/user/:id', async (req, res) => {
        try {
            const user = await User.findOne({ _id: req.params.id })
            if (!user) throw new Error('Not match.')
            if (user.role === 'superAdmin')
                throw new Error('Can not delele super amdin.')
            await user.deleteOne()
            utils.sendSuccess(res)
        } catch (err) {
            console.log(err)
            utils.sendError(res, err.message)
        }
    })
}

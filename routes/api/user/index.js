import { adminPermission } from '#root/routes/middleware/permission'
import User from '#root/db/models/User'

export default (app, utils) => {
    /*
    ** Fetch info of user
    ** Method   GET
    ** Access   superAdmin, admin, teacher, student
    ** Page     - All logged in page
    */
    app.get('/api/user/info', async (req, res) => {
        const user = req.user.toObject()
        delete user.password
        // superAdmin is a system admin only used on backend
        if (user.role === 'superAdmin') user.role = 'admin'
        utils.sendSuccess(res, user)
    })

    /*
    ** Create user
    ** Method   POST
    ** Access   superAdmin, admin
    ** Page     - /user/add
    */
    app.post('/api/user/add', adminPermission(), async (req, res) => {
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

    /*
    ** Fetch list of user
    ** Method   POST
    ** Access   superAdmin, admin
    ** Page     - /user
    */
    app.get('/api/user', adminPermission(), async (req, res) => {
        try {
            const users = await User.find({})
            utils.sendSuccess(res, users)
        } catch (err) {
            console.log(err)
            utils.sendError(res, err.message)
        }
    })

    /*
    ** Delete user
    ** Method   DELETE
    ** Access   superAdmin, admin
    ** Page     - /user
    */
    app.delete('/api/user/:id', adminPermission(), async (req, res) => {
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

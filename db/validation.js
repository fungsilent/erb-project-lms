import config from '#root/config'
import User from '#root/db/models/User'

export default async () => {
    console.log('[DB] data validating...')
    try {
        await keepSystemAdmin()
    } catch (err) {
        console.log('[DB] data validation', err)
    }
    console.log('[DB] data validated')
}

const keepSystemAdmin = async () => {
    const adminData = config.db.adminData
    const user = await User.findOne({ email: adminData.email })
    if (!user) {
        console.log('[DB] create system admin')
        const admin = new User(adminData)
        await admin.save()
    }
}
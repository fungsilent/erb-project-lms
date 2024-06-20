import config from '#root/config'
import User from '#root/db/models/User'

export default async () => {
    const adminData = config.db.adminData
    const user = await User.findOne({ email: adminData.email })
    if (!user) {
        console.log('[DB] initializing...')
        try {
            const admin = new User(adminData)
            await admin.save()
        } catch (err) {
            console.log('[DB] initializetion', err)
        }
    }
}

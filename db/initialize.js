import User from '#root/db/models/User'

export default async () => {
    const adminData = {
        name: 'admin',
        email: 'admin@admin.com',
        password: 'admin',
        role: 'admin',
    }
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

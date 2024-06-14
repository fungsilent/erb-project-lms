import mongoose from 'mongoose'
import config from '#root/config'

const connectDatabase = async () => {
    try {
        console.log('[DB] connecting...')
        await mongoose.connect(config.db.host)
        console.log('[DB] connected')
    } catch (err) {
        console.error('[DB] connect failed', err.message)
        process.exit(1)
    }
}

export default connectDatabase
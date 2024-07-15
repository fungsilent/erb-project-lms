import fs from 'fs'
import mongoose from 'mongoose'
import { EJSON } from 'bson'
import connectDatabase from '#root/db/connect'


const presetData = async () => {
    console.log('[DB] reset start...')
    const jsonFolder = './db/json'
    const client = mongoose.connection.client

    const tasks = fs.readdirSync(jsonFolder).map(async file => {
        const [dbName, dbCollection] = file.split('.')
        let result
        try {
            const collection = client.db(dbName).collection(dbCollection)
            await collection.drop()

            const data = fs.readFileSync(`${jsonFolder}/${file}`)
            const dataset = EJSON.parse(data)

            await collection.insertMany(dataset)
            result = true
        } catch (err) {
            console.log(`[DB] ${dbName}.${dbCollection}`, err)
            result = false
        }
        return [dbName, dbCollection, result]
    })
    const result = await Promise.all(tasks)
    console.log('[DB] reset result:', result)
}

const resetDatabase = async () => {
    try {
        await connectDatabase()
        await presetData()
        await mongoose.connection.close()
    } catch (err) {
        console.log('[DB] reset', err)
    }
    process.exit(1)
}
resetDatabase()
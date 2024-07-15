import fs from 'fs'
import mongoose from 'mongoose'
import _ from 'lodash'
import { EJSON } from 'bson'
import connectDatabase from '#root/db/connect'

const resetData = async () => {
    console.log('[DB] reset start...')
    const jsonFolder = './db/json'
    const client = mongoose.connection.client

    const tasks = fs.readdirSync(jsonFolder).map(async file => {
        const [match, dbName, dbCollection] = file.match(/(^\w+).(\w+).json$/) || []
        if (!match) return null
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
    let tasksResult = await Promise.all(tasks)
    tasksResult = _.filter(tasksResult, item => item != null)
    console.log('[DB] reset result:', tasksResult)
}

const resetDatabase = async () => {
    try {
        await connectDatabase()
        await resetData()
        await mongoose.connection.close()
    } catch (err) {
        console.log('[DB] reset', err)
    }
    process.exit(1)
}
resetDatabase()
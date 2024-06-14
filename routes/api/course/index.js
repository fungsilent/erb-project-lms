//import { Router } from 'express'
import Course from '../../../models/Course.js'
//import Course from '#root/models/Course.js'


//const router = Router()

export default (app, utils) => {
    // Add course route (POST)
    app.post('/add', async (req, res) => {
        const { name, description, teacher } = req.body
        try {
            const course = new Course({ name, description, teacher })
            await course.save()
            res.status(201).send('Course added')
        } catch (err) {
            res.status(400).send(err.message)
        }
    })

    // Get all courses (GET)
    app.get('/', async (req, res) => {
        try {
            const courses = await Course.find()
            res.status(200).json(courses)
        } catch (err) {
            res.status(500).send(err.message)
        }
    })
}

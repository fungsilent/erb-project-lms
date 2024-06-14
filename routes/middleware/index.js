import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import auth from '#root/routes/middleware/auth'

const setMiddleware = (app, utils) => {
    // base
    app.use(logger('dev'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use(cookieParser())

    app.use(auth)
}
export default setMiddleware
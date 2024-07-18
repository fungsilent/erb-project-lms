import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import { auth } from '#root/routes/middleware/auth'

const setMiddleware = (app, utils) => {
    // Basic middleware
    app.use(logger('dev'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use(cookieParser())

    // Layout support for ejs in express
    app.use(expressLayouts)
    
    // JWT authorization
    app.use(auth)
}
export default setMiddleware

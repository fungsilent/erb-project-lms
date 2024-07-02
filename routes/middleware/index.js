import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import { auth } from '#root/routes/middleware/auth'

const setMiddleware = (app, utils) => {
    app.use(logger('dev'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use(cookieParser())
    app.use(expressLayouts)
    
    // Serve static files (for uploaded files)
    app.use('/uploads', express.static('uploads'));
    app.use(auth)
}
export default setMiddleware

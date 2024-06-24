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

    app.use(auth)
    // Wrap res.render
    app.use(async (req, res, next) => {
        res._render = res.render
        res.render = (view, locals = {}, callback) => {
            let newLocals = locals
            // Set user to all view
            if (req.auth) {
                const user = req.user.toObject()
                if (user.role === 'superAdmin') user.role = 'admin'
                newLocals = {
                    ...newLocals,
                    user,
                }
            }
            res._render(view, newLocals, callback)
        }
        next()
    })
}
export default setMiddleware

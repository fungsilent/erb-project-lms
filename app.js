import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import utils from '#root/routes/utils'
import connectDB from './config/database.js'

// router
import viewRouter from '#root/routes/views'
import apiRouter from '#root/routes/api'
//import { connect } from 'http2' ??

// config
global.__root = import.meta.dirname; // same as __dirname
global.__jwtKey = '1&amp;2vpKA$IE8$CNLrbe9dz'
const port = 8888

const app = express()

// Connect to database
connectDB()

/*
 * config
 */
const setConfig = app => {
    // view engine setup
    app.set('views', path.join(global.__root, 'views'))
    app.set('view engine', 'ejs')
    app.listen(port, () => console.log(`Server listen on http://localhost:${port}`))
}

/*
 * middleware
 */
const setMiddleware = app => {
    app.use(logger('dev'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use(cookieParser())
    app.use(express.static(path.join(global.__root, 'public')))
}

/*
 * router
 */
const setRouter = app => {
    viewRouter(app, utils)
    apiRouter(app, utils)

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        next(createError(404))
    })

    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message
        res.locals.error = req.app.get('env') === 'development' ? err : {}

        // render the error page
        res.status(err.status || 500)
        res.render('error')
    })
}

setConfig(app)
setMiddleware(app)
setRouter(app)
export default app
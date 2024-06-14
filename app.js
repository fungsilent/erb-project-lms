import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import config from '#root/config'
import utils from '#root/routes/utils'

// router
import viewRouter from '#root/routes/views/route'
import apiRouter from '#root/routes/api/route'

// config
const dirname = import.meta.dirname // same as __dirname
process.env.jwtKey = config.jwtKey
process.env.passwordSalt = config.passwordSalt
const app = express()

/*
 * config
 */
const setConfig = app => {
    // view engine setup
    app.set('views', path.join(dirname, 'views'))
    app.set('view engine', 'ejs')
}

/*
 * middleware
 */
const setMiddleware = app => {
    app.use(logger('dev'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use(cookieParser())
    app.use(express.static(path.join(dirname, 'public')))
}

/*
 * router
 */
const setRouter = app => {
    viewRouter(app, utils)
    apiRouter(app, utils)

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        console.log('404')
        next(createError(404))
    })

    // error handler
    app.use((err, req, res, next) => {
        console.log('error')
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
app.listen(config.port, () => console.log(`Server listen on http://localhost:${config.port}`))
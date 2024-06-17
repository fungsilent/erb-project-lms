import createError from 'http-errors'
import express from 'express'
import path from 'path'
import config from '#root/config'
import utils from '#root/routes/utils'
import connectDatabase from '#root/db/connect'
import setMiddleware from '#root/routes/middleware'

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
const setConfig = () => {
    // view engine setup
    app.set('views', path.join(dirname, 'views'))
    app.set('view engine', 'ejs')
}

/*
 * router
 */
const setRouter = () => {
    app.use(express.static(path.join(dirname, 'public')))
    apiRouter(app, utils)
    viewRouter(app, utils)  // must be the last

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        next(createError(404))
    })

    // error handler
    app.use((err, req, res, next) => {
        // set locals, only providing error in development
        res.locals.message = err.message
        res.locals.error = req.app.get('env') === 'development' ? err : {}

        // render the error page
        res.status(err.status || 500)
        res.render('error')
    })
}

/*
 * start server
 */

const startServer = async () => {
    await connectDatabase()
    setConfig()
    setMiddleware(app, utils)
    setRouter()
    app.listen(config.port, () => console.log(`Server listen on http://localhost:${config.port}`))
}
startServer()
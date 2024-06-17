import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

const setMiddleware = (app, utils) => {
    // base
    app.use(logger('dev'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use(cookieParser())
}
export default setMiddleware
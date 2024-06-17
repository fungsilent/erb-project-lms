import moment from 'moment'

const sendError = (res, message) => {
    res.status(400).json({ success: false, message })
}

const sendSuccess = (res, data = {}) => {
    res.status(200).json({ success: true, data })
}

const getTimestamp = date => {
    return moment(date).unix() * 1000 // in seconds
}

export default {
    sendSuccess,
    sendError,
    getTimestamp,
}

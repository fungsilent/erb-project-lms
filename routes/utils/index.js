import moment from 'moment'
import _ from 'lodash'

const sendError = (res, message) => {
    res.json({ success: false, message })
}

const sendSuccess = (res, data = {}) => {
    res.json({ success: true, data })
}

const getTimestamp = date => {
    return moment(date).unix() * 1000 // in seconds
}

const getCourseDays = course => {
    let current = moment(course.startDate)
    let days = []
    while (current.isSameOrBefore(course.endDate)) {
        days.push(current.format('YYYY-MM-DD'))
        current.add(1, 'days')
    }
    const excludeDates = course.excludeDates.map(date => moment(date).format('YYYY-MM-DD'))
    return _.difference(days, excludeDates)
}

export default {
    sendSuccess,
    sendError,
    getTimestamp,
    getCourseDays,
}

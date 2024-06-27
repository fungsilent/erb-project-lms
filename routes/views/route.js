// import userView from '#root/routes/views/user'
// import courseView from '#root/routes/views/course'
// import calendarView from '#root/routes/views/calendar'

export default (app, utils) => {
    const viewRoutes = [
        // user
        { path: '/', view: 'login', locals: { layout: 'layouts/blank' } },
        { path: '/dashboard', view: 'dashboard/main' },
        { path: '/user', view: 'user/list' },
        { path: '/user/add', view: 'user/add' },

        // course
        { path: '/course', view: 'course/list' },
        { path: '/course/add', view: 'course/add' },
        { path: '/course/edit/:id', view: 'course/edit' },

        // calendar
        { path: '/calendar', view: 'calendar' },
    ]

    // map route
    viewRoutes.forEach(route => {
        app.get(route.path, (req, res) => {
            res.render(route.view, route.locals)
        })
    })
}

export default (app, utils) => {
    const viewRoutes = [
        // user
        { path: '/', view: 'login', locals: { layout: 'layouts/blank' } },
        { path: '/dashboard', view: 'dashboard/main' },
        { path: '/user', view: 'user/list' },
        { path: '/user/add', view: 'user/add' },

        // announcement
        { path: '/announcement', view: 'announcement/list' },
        { path: '/announcement/add', view: 'announcement/add' },
        { path: '/announcement/edit/:id', view: 'announcement/edit' },

        // course
        { path: '/course', view: 'course/list' },
        { path: '/course/add', view: 'course/add' },
        { path: '/course/edit/:id', view: 'course/edit' },
        { path: '/course/detail/:id', view: 'course/details' },
        { path: '/course/student/:id', view: 'course/student' },

        // calendar
        { path: '/calendar', view: 'calendar' },

        // assignment
        { path: '/course/assignments/add/:id', view: 'course/assignments/add' },
        { path: '/course/assignments/edit/:id', view: 'course/assignments/edit' },
        { path: '/course/assignments/mark/:id', view: 'course/assignments/mark' },

        //attendance
        { path: '/attendance', view: 'attendance/list' },
        { path: '/attendance/mark/:courseId', view: 'attendance/mark' },

    ]

    // map route
    viewRoutes.forEach(route => {
        app.get(route.path, (req, res) => {
            res.render(route.view, route.locals)
        })
    })
}

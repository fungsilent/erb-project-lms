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
        { path: '/assignments', view: 'assignments/list_assignment' },
        { path: '/assignments/add/', view: 'assignments/list_course' },
        { path: '/assignments/add/:id', view: 'assignments/add' },

        { path: '/assignments/edit/:id', view: 'assignments/edit' },
        { path: '/assignments/mark/:id', view: 'assignments/mark_assignment' },

        //attendance
        { path: '/attendance', view: 'attendance/list' },
        { path: '/attendance/mark/:courseId', view: 'attendance/mark' },
        { path: '/attendance/records/:id', view: 'attendance/records' },

    ]

    // map route
    viewRoutes.forEach(route => {
        app.get(route.path, (req, res) => {
            res.render(route.view, route.locals)
        })
    })
}

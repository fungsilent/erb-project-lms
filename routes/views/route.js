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

        // announcement
        { path: '/announcement', view: 'announcement/list' },
        { path: '/announcement/add', view: 'announcement/add' },
        { path: '/announcement/edit/:id', view: 'announcement/edit' },

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

    app.get('/announcement/edit/:id', async (req, res) => {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).render('error', { message: 'Announcement not found' });
        }
        const { _id: id, content, to } = announcement
        res.render('announcement/edit', { id, content, to, user: formatUser(req.user) });
    });
}

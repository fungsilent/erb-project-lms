export default app => {
    // view
    app.get('/', (req, res) => {
        res.render('login')
    })

    app.get('/dashboard', (req, res) => {
        const data = {
            user: {
                name: 'Admin001',
                role: 'admin',
                isAdmin: true,
                isTeacher: false,
            }
        }
        res.render('dashboard', data)
    })
}
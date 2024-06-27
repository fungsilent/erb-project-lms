import moment from 'moment'
import Announcement from '#root/db/models/Announcement'

export default (app, utils) => {
    // create announcement (GET)
    app.get('/api/announcement', async (req, res) => {
        try {
            let option = {}
            switch (req.user.role) {
                // case 'superAdmin':
                // case 'teacher': {
                //     option = {}
                //     break
                // }
                case 'teacher': {
                    option = { 'to.teacher': true }
                    break
                }
                case 'student': {
                    option = { 'to.student': true }
                    break
                }
            }
            const announcements = await Announcement.find(option)
            utils.sendSuccess(res, announcements)
        } catch (err) {
            console.log(err)
            utils.sendError(res, err.message)
        }
    })

    // create announcement (POST)
    app.post('/api/announcement/add', async (req, res) => {
        const { content, courseId, to } = req.body
        try {
            const announcement = new Announcement({
                date: moment().toDate(),
                content,
                courseId,
                to: {
                    [to]: true,
                },
            })
            await announcement.save()
            utils.sendSuccess(res)
        } catch (err) {
            console.log(err)
            utils.sendError(res, err.message)
        }
    })
}

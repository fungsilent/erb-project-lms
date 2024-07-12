import moment from 'moment'
import Announcement from '#root/db/models/Announcement'

export default (app, utils) => {
    // get announcement list (GET)
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
            const announcements = await Announcement.find(option).sort({ date: -1 })
            utils.sendSuccess(res, announcements)
        } catch (err) {
            console.log(err)
            utils.sendError(res, err.message)
        }
    })
    
    // get announcement detail (GET)
    app.get('/api/announcement/:id', async (req, res) => {
        try {
            const announcement = await Announcement.findById(req.params.id)
            if (!announcement) {
                throw new Error('Announcement not found')
            }
            utils.sendSuccess(res, announcement)
        } catch (err) {
            console.log(err)
            utils.sendError(res, err.message)
        }
    })

    // create announcement (POST)
    app.post('/api/announcement/add', async (req, res) => {
        const { content, to } = req.body
        try {
            const announcement = new Announcement({
                date: moment().toDate(),
                content,
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

    // delete announcement (POST)
    app.delete('/api/announcement/:id', async (req, res) => {
        const deleteId = req.params.id
        try {
            const { deletedCount } = await Announcement.deleteOne({_id:deleteId});
            if (deletedCount < 1) {
                throw new Error('Announcement not found')
            }
            utils.sendSuccess(res)
        } catch (err) {
            console.log(err)
            utils.sendError(res, err.message)
        }
    })

    // edit announcement (POST)
    app.put('/api/announcement/:id', async (req, res) => {
        const { content, to } = req.body
        const announcementId = req.params.id
        try {
            let announcement = await Announcement.findOne({_id:announcementId});
            if (announcement) { //if return false, no action
                announcement.content = content;
                announcement.date = moment().toDate(),
                announcement.to = {
                    all: false,
                    student: false,
                    teacher: false,
                    [to]: true,
                },
                // await announcement.updateOne ({_id:announcementId}, announcement);
                await announcement.save()
            }
            utils.sendSuccess(res)
        } catch (err) {
            console.log(err)
            utils.sendError(res, err.message)
        }
    })
}

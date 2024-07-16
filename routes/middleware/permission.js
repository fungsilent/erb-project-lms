import utils from '#root/routes/utils'

const defaultRolePermission = ['superAdmin', 'admin', 'teacher', 'student'] 

export const rolePermission = (rolePermission = defaultRolePermission) => {
    return async (req, res, next) => {
        if (!rolePermission.includes(req.user.role)) {
            return utils.sendError(res, 'permission denied')
        }
        next()
    }
}

export const adminPermission = (addon = []) => {
    return rolePermission(['superAdmin', 'admin', ...addon])
}

export const teacherPermission = (addon = []) => {
    return adminPermission(['teacher', ...addon])
}

export const studentPermission = (addon = []) => {
    return adminPermission(['student', ...addon])
}

export default {
    rolePermission,
    adminPermission,
    teacherPermission,
    studentPermission,
}

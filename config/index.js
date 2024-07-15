export default {
    port: 3000,
    jwtKey: '1&amp;2vpKA$IE8$CNLrbe9dz',
    passwordSalt: '$2a$10$JW2eicISpWglmYENAPBm5e',
    db: {
        host: 'mongodb://localhost:27017/erblmstest',
        adminData: {
            name: 'admin',
            email: 'admin@admin.com',
            password: 'admin',
            role: 'superAdmin',
        },
    },
}

import express from 'express';
import Course from '#root/db/models/Course.js';
import User from '#root/db/models/User.js';

const formatUser = user => {
    const format = user.toObject();
    if (user.role === 'superAdmin') {
        format.role = 'admin';
    }
    return format;
};

export default (app) => {
    // List courses and display add course form (GET)
    app.get('/course', async (req, res) => {
        const user = formatUser(req.user);
        let courses;

        if (user.role === 'admin' || user.role === 'superAdmin') {
            courses = await Course.find().populate('teacher');
        } else if (user.role === 'teacher') {
            courses = await Course.find({ teacher: user._id }).populate('teacher');
        } else if (user.role === 'student') {
            courses = await Course.find({ students: user._id }).populate('teacher');
        } else {
            courses = [];
        }

        res.render('course/list', { user: req.user, courses });
    });

    // Display add course form (GET)
    app.get('/course/add', async (req, res) => {
        const user = formatUser(req.user);
        const teachers = await User.find({ role: { $in: ['teacher', 'admin', 'superAdmin'] } });
        const students = await User.find({ role: 'student' });
        res.render('course/add', { user: req.user, teachers, students });
    });

    // Render edit course page
    app.get('/course/edit/:id', async (req, res) => {
        const course = await Course.findById(req.params.id).populate('teacher students');
        const teachers = await User.find({ role: { $in: ['teacher', 'admin', 'superAdmin'] } });
        const students = await User.find({ role: 'student' });
        if (!course) {
            return res.status(404).render('error', { message: 'Course not found' });
        }
        res.render('course/edit', { course, teachers, students, user: req.user });
    });
};

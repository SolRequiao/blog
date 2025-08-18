const express = require('express');
const router = express.Router();
const User = require('./User.js');
const bcrypt = require('bcryptjs');
const adminAuth = require('../middlewares/adminAuth')


router.get('/admin/users/new', adminAuth, (req, res) => {
    let errors = [];
    if (req.query.state) {
        const { errors: e = [] } = JSON.parse(req.query.state);
        errors = e;
    }
    res.render('admin/users/new', {
        page_title: 'New User',
        errors
    });
});

router.get('/admin/users/:num', adminAuth, (req, res) => {
    let { num } = req.params || 0;
    let offset = 0;
    if (isNaN(num) || num === 1) {
        offset = 0;
    } else {
        offset = parseInt(num) * 20;
    }
    User.findAndCountAll({
        offset: offset,
        limit: 20,
        order: [['username', 'ASC']]
    }).then(user => {
        let next = true ? offset + 20 < user.count : false;
        res.render('admin/users', {
            page_title: 'Users',
            user: user,
            num: parseInt(num),
            next: next
        });
    })
});



router.post('/user/save', adminAuth, (req, res) => {
    const { userName, email, password, confirmPassword } = req.body;
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(password, salt)
    User.create({
        username: userName,
        email: email.toLowerCase(),
        passwordV: password,
        confirmPasswordV: confirmPassword,
        password: hash
    }).then(() => {
        res.redirect('/admin/users/0');
    }).catch(e => {
        if (e.name === 'SequelizeValidationError' || e.name === 'SequelizeUniqueConstraintError') {
            const errors = e.errors.map(x => ({
                //field: x.path,
                //rule: x.validatorKey,
                message: x.message
            }));
            const msgError = { errors, formData: { userName, email } };
            const state = encodeURIComponent(JSON.stringify(msgError));
            return res.redirect(`/admin/users/new?state=${state}`)
        }
        console.error('Erro to create new User', e)
        return res.redirect(`/error?msgError=${encodeURIComponent('Error to create new User')}`)
    });
});

router.get('/login', (req, res) => {
    let errors = [];
    if (req.query.state) {
        const { errors: e = [] } = JSON.parse(req.query.state);
        errors = e;
    }
    res.render('login', {
        page_title: 'Login',
        errors
    });
});

router.post('/authenticate', (req, res) => {
    const { email, password } = req.body;
    const fail = (messages, formData = { email }) => {
        const errors = (Array.isArray(messages) ? messages : [messages]).map(message => ({ message }));
        const state = encodeURIComponent(JSON.stringify({ errors, formData }));
        return res.redirect(`/login?state=${state}`);
    };
    if (!email || !password) {
        return fail('Email and password are required');
    }
    User.findOne({
        where: {
            email: email
        }
    }).then(user => {
        if (!user) {
            throw new Error('Email does not exist');
        }
        const correct = bcrypt.compareSync(password, user.password);
        if (!correct) {
            throw new Error('Invalid password');
        }
        req.session.user = {
            id: user.id,
            email: user.email,
            username: user.username
        };
        return res.redirect('/admin/users/0');
    }).catch(e => {
        if (e.name === 'SequelizeValidationError' || e.name === 'SequelizeUniqueConstraintError') {
            const errors = (e.errors || []).map(x => ({ message: x.message }));
            const state = encodeURIComponent(JSON.stringify({ errors, formData: { email } }));
            return res.redirect(`/login?state=${state}`);
        }
        if (e instanceof Error && !e.errors) {
            return fail(e.message);
        }
        console.error('Auth error:', e);
        return res.redirect(`/error?msgError=${encodeURIComponent('Internal authentication error')}`);
    })
});

router.get('/logout', (req, res) =>{
    req.session.user = undefined;
    res.redirect('/');
})

module.exports = router;
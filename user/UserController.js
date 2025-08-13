const express = require('express');
const router = express.Router();
const User = require('./User.js');
const bcrypt = require('bcryptjs');


router.get('/admin/users/new', (req, res) => {
    let errors = [];
    if (req.query.state) {
        const { errors: e = [] } = JSON.parse(req.query.state);
        errors = e
    }
    res.render('admin/users/new', {
        page_title: 'New User',
        msgError: req.query.msgError,
        errors
    });
});

router.get('/admin/users/:num', (req, res) => {
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



router.post('/user/save', (req, res) => {
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

module.exports = router;